package com.replayclub.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ReplayClubApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReplayClubApplication.class, args);
    }
}
