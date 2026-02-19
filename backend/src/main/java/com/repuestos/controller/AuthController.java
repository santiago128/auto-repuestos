package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.dto.LoginRequest;
import com.repuestos.dto.RegisterRequest;
import com.repuestos.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@Valid @RequestBody LoginRequest req) {
        var data = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", data));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(@Valid @RequestBody RegisterRequest req) {
        var data = authService.register(req);
        return ResponseEntity.ok(ApiResponse.ok("Registro exitoso", data));
    }
}
