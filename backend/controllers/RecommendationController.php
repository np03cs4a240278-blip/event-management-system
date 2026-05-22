<?php

class RecommendationController
{
    private $bookings;
    private $events;

    private const MAX_RECOMMENDATIONS = 6;
    private const STOP_WORDS = [
        'about', 'after', 'again', 'also', 'an', 'and', 'any', 'are', 'attend', 'attendees',
        'be', 'been', 'before', 'between', 'build', 'building', 'by', 'can', 'day', 'event',
        'events', 'evening', 'for', 'from', 'full', 'get', 'great', 'hands', 'into', 'its',
        'local', 'more', 'new', 'night', 'not', 'of', 'on', 'one', 'our', 'out', 'over',
        'premium', 'sessions', 'showcase', 'startup', 'the', 'their', 'this', 'today', 'with',
        'work', 'workshop', 'workshops', 'your',
    ];

    public function __construct($bookings, $events)
    {
        $this->bookings = $bookings;
        $this->events = $events;
    }

    public function index()
    {
        $user = requireAuth();

        if (($user['role'] ?? 'user') === 'admin') {
            jsonResponse(['message' => 'Recommendations are only available for attendee accounts.'], 403);
        }

        $allEvents = $this->events->all();
        $userBookings = $this->bookings->userBookings($user['id']);
        $allBookings = $this->bookings->allBookings();

        $profile = $this->buildUserProfile($userBookings);
        $recommendations = $this->scoreEvents($allEvents, $userBookings, $allBookings, $profile);

        jsonResponse([
            'generated_at' => date('c'),
            'personalized' => $profile['booking_count'] > 0,
            'profile' => [
                'booking_count' => $profile['booking_count'],
                'top_categories' => $this->formatTopEntries($profile['category_counts']),
                'top_locations' => $this->formatTopEntries($profile['location_counts']),
                'favorite_keywords' => array_slice(array_keys($profile['keyword_counts']), 0, 5),
                'average_budget' => $profile['average_budget'],
                'profile_summary' => $this->buildProfileSummary($profile),
            ],
            'recommendations' => array_slice($recommendations, 0, self::MAX_RECOMMENDATIONS),
        ]);
    }

    private function buildUserProfile(array $userBookings): array
    {
        $categoryCounts = [];
        $locationCounts = [];
        $keywordCounts = [];
        $prices = [];
        $lastActivityAt = null;

        foreach ($userBookings as $booking) {
            $event = $booking['event'] ?? [];
            $category = trim((string)($event['category'] ?? $booking['event_type'] ?? 'General'));
            $location = trim((string)($event['location'] ?? ''));
            $price = (float)($booking['total_price'] ?? $event['price'] ?? 0);
            $createdAt = $booking['created_at'] ?? null;

            if ($category !== '') {
                $categoryCounts[$category] = ($categoryCounts[$category] ?? 0) + 1;
            }

            if ($location !== '') {
                $locationCounts[$location] = ($locationCounts[$location] ?? 0) + 1;
            }

            if ($price > 0) {
                $prices[] = $price;
            }

            if ($createdAt && ($lastActivityAt === null || strtotime($createdAt) > strtotime($lastActivityAt))) {
                $lastActivityAt = $createdAt;
            }

            $text = trim(implode(' ', [
                (string)($event['title'] ?? ''),
                (string)($event['description'] ?? ''),
                (string)($booking['event_type'] ?? ''),
            ]));

            foreach ($this->extractKeywords($text) as $keyword) {
                $keywordCounts[$keyword] = ($keywordCounts[$keyword] ?? 0) + 1;
            }
        }

        arsort($categoryCounts);
        arsort($locationCounts);
        arsort($keywordCounts);

        return [
            'booking_count' => count($userBookings),
            'booked_event_ids' => array_values(array_map(static fn ($booking) => (int)($booking['event']['id'] ?? 0), $userBookings)),
            'category_counts' => $categoryCounts,
            'location_counts' => $locationCounts,
            'keyword_counts' => $keywordCounts,
            'average_budget' => count($prices) > 0 ? round(array_sum($prices) / count($prices), 2) : null,
            'last_activity_at' => $lastActivityAt,
        ];
    }

    private function scoreEvents(array $allEvents, array $userBookings, array $allBookings, array $profile): array
    {
        $today = date('Y-m-d');
        $bookedEventIds = array_flip(array_filter($profile['booked_event_ids']));
        $globalPopularity = [];

        foreach ($allBookings as $booking) {
            $eventId = (int)($booking['event']['id'] ?? 0);
            if ($eventId <= 0) {
                continue;
            }

            $globalPopularity[$eventId] = ($globalPopularity[$eventId] ?? 0) + 1;
        }

        $maxPopularity = empty($globalPopularity) ? 0 : max($globalPopularity);
        $recommendations = [];

        foreach ($allEvents as $event) {
            $eventId = (int)($event['id'] ?? 0);
            $eventDate = (string)($event['date'] ?? '');

            if ($eventId <= 0 || isset($bookedEventIds[$eventId]) || ($eventDate !== '' && $eventDate < $today)) {
                continue;
            }

            $reasons = [];
            $score = 0.0;
            $category = trim((string)($event['category'] ?? 'General'));
            $location = trim((string)($event['location'] ?? ''));
            $price = (float)($event['price'] ?? 0);
            $daysUntil = $this->daysUntil($eventDate);

            $categoryWeight = $profile['booking_count'] > 0 ? $this->normalizedCount($profile['category_counts'], $category) : 0;
            if ($categoryWeight > 0) {
                $categoryScore = 38 * $categoryWeight + 10;
                $score += $categoryScore;
                $reasons[] = [
                    'label' => "Matches your {$category} interest",
                    'weight' => $categoryScore,
                ];
            }

            $locationWeight = $profile['booking_count'] > 0 ? $this->normalizedCount($profile['location_counts'], $location) : 0;
            if ($locationWeight > 0) {
                $locationScore = 18 * $locationWeight;
                $score += $locationScore;
                $reasons[] = [
                    'label' => "Popular in your usual area: {$location}",
                    'weight' => $locationScore,
                ];
            }

            if ($profile['average_budget'] !== null) {
                $budgetScore = $this->calculateBudgetScore($price, (float)$profile['average_budget']);
                if ($budgetScore > 0) {
                    $score += $budgetScore;
                    $reasons[] = [
                        'label' => 'Fits your typical booking budget',
                        'weight' => $budgetScore,
                    ];
                }
            }

            $keywordScore = $this->calculateKeywordScore($event, $profile['keyword_counts']);
            if ($keywordScore['score'] > 0) {
                $score += $keywordScore['score'];
                $reasons[] = [
                    'label' => 'Similar themes: ' . implode(', ', $keywordScore['matches']),
                    'weight' => $keywordScore['score'],
                ];
            }

            $popularityCount = $globalPopularity[$eventId] ?? 0;
            if ($maxPopularity > 0 && $popularityCount > 0) {
                $popularityScore = 14 * ($popularityCount / $maxPopularity);
                $score += $popularityScore;
                $reasons[] = [
                    'label' => 'Trending with other attendees',
                    'weight' => $popularityScore,
                ];
            }

            if ($daysUntil !== null) {
                $freshnessScore = max(0, 10 - min($daysUntil, 45) / 5);
                $score += $freshnessScore;
                if ($freshnessScore >= 5) {
                    $reasons[] = [
                        'label' => 'Coming up soon',
                        'weight' => $freshnessScore,
                    ];
                }
            }

            if ($profile['booking_count'] === 0 && $categoryWeight === 0) {
                if ($category !== '') {
                    $score += 8;
                    $reasons[] = [
                        'label' => "Good starter pick in {$category}",
                        'weight' => 8,
                    ];
                }

                if ($price <= 0) {
                    $score += 4;
                    $reasons[] = [
                        'label' => 'Free to attend',
                        'weight' => 4,
                    ];
                }
            }

            usort($reasons, static fn ($left, $right) => $right['weight'] <=> $left['weight']);
            $reasonLabels = array_values(array_unique(array_map(static fn ($reason) => $reason['label'], array_slice($reasons, 0, 3))));

            $recommendations[] = array_merge($event, [
                'recommendation_score' => round($score, 1),
                'recommendation_confidence' => $this->resolveConfidence($score, $profile['booking_count']),
                'recommendation_reasons' => $reasonLabels,
                'popularity_count' => $popularityCount,
                'days_until' => $daysUntil,
            ]);
        }

        usort(
            $recommendations,
            static fn ($left, $right) => ($right['recommendation_score'] <=> $left['recommendation_score'])
                ?: strcmp((string)($left['date'] ?? ''), (string)($right['date'] ?? ''))
        );

        return $recommendations;
    }

    private function formatTopEntries(array $counts, int $limit = 3): array
    {
        $formatted = [];
        foreach (array_slice($counts, 0, $limit, true) as $name => $count) {
            $formatted[] = [
                'name' => $name,
                'count' => $count,
            ];
        }

        return $formatted;
    }

    private function buildProfileSummary(array $profile): string
    {
        if ($profile['booking_count'] === 0) {
            return 'No booking history yet, so recommendations lean on trending events, timing, and accessible price points.';
        }

        $topCategory = array_key_first($profile['category_counts']);
        $topLocation = array_key_first($profile['location_counts']);
        $segments = [];

        if ($topCategory) {
            $segments[] = strtolower($topCategory) . ' events';
        }

        if ($topLocation) {
            $segments[] = 'in ' . $topLocation;
        }

        if ($profile['average_budget'] !== null) {
            $segments[] = 'with budgets around Rs. ' . number_format((float)$profile['average_budget'], 2);
        }

        return 'Recommendations are tuned to your ' . implode(', ', $segments) . '.';
    }

    private function normalizedCount(array $counts, string $key): float
    {
        if ($key === '' || empty($counts) || !isset($counts[$key])) {
            return 0.0;
        }

        $maxCount = max($counts);
        if ($maxCount <= 0) {
            return 0.0;
        }

        return $counts[$key] / $maxCount;
    }

    private function calculateBudgetScore(float $eventPrice, float $averageBudget): float
    {
        if ($averageBudget <= 0) {
            return $eventPrice <= 0 ? 12.0 : max(0.0, 8.0 - ($eventPrice / 20));
        }

        $relativeDifference = abs($eventPrice - $averageBudget) / max($averageBudget, 1);

        return max(0.0, 18.0 - ($relativeDifference * 18.0));
    }

    private function calculateKeywordScore(array $event, array $keywordCounts): array
    {
        if (empty($keywordCounts)) {
            return ['score' => 0.0, 'matches' => []];
        }

        $candidateKeywords = $this->extractKeywords(implode(' ', [
            (string)($event['title'] ?? ''),
            (string)($event['description'] ?? ''),
            (string)($event['category'] ?? ''),
        ]));

        if (empty($candidateKeywords)) {
            return ['score' => 0.0, 'matches' => []];
        }

        $score = 0.0;
        $matches = [];

        foreach ($candidateKeywords as $keyword) {
            if (!isset($keywordCounts[$keyword])) {
                continue;
            }

            $score += min(6, 2 + $keywordCounts[$keyword]);
            $matches[] = $keyword;
        }

        $matches = array_slice(array_values(array_unique($matches)), 0, 3);

        return [
            'score' => min(16.0, $score),
            'matches' => $matches,
        ];
    }

    private function extractKeywords(string $text): array
    {
        $normalized = strtolower($text);
        $normalized = preg_replace('/[^a-z0-9\s]+/', ' ', $normalized);
        $parts = preg_split('/\s+/', trim((string)$normalized)) ?: [];
        $keywords = [];

        foreach ($parts as $part) {
            if ($part === '' || ctype_digit($part) || strlen($part) < 4 || in_array($part, self::STOP_WORDS, true)) {
                continue;
            }

            $keywords[] = $part;
        }

        return array_values(array_unique($keywords));
    }

    private function daysUntil(string $date): ?int
    {
        if ($date === '' || strtotime($date) === false) {
            return null;
        }

        $seconds = strtotime($date . ' 00:00:00') - strtotime(date('Y-m-d') . ' 00:00:00');

        return (int) floor($seconds / 86400);
    }

    private function resolveConfidence(float $score, int $bookingCount): string
    {
        if ($bookingCount === 0) {
            return $score >= 22 ? 'medium' : 'explore';
        }

        if ($score >= 55) {
            return 'high';
        }

        if ($score >= 32) {
            return 'medium';
        }

        return 'low';
    }
}
