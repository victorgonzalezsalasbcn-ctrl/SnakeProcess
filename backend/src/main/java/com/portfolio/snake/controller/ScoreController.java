package com.portfolio.snake.controller;

import com.portfolio.snake.dto.ScoreRequest;
import com.portfolio.snake.dto.ScoreResponse;
import com.portfolio.snake.service.ScoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService service;

    @GetMapping
    public List<ScoreResponse> leaderboard() {
        return service.getLeaderboard();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScoreResponse submit(@Valid @RequestBody ScoreRequest req) {
        return service.save(req);
    }
}
