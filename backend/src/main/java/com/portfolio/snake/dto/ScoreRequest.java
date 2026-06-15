package com.portfolio.snake.dto;

import jakarta.validation.constraints.*;

public record ScoreRequest(
    @NotBlank @Size(min = 2, max = 20) String playerName,
    @Min(0) int score,
    @Min(1) int level
) {}
