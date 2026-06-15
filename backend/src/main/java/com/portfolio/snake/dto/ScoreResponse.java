package com.portfolio.snake.dto;

import java.time.LocalDateTime;

public record ScoreResponse(
    Long id,
    String playerName,
    int score,
    int level,
    LocalDateTime createdAt
) {}
