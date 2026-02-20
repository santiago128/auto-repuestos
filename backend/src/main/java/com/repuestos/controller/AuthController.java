package com.repuestos.controller;

import com.repuestos.dto.ApiResponse;
import com.repuestos.dto.ForgotPasswordRequest;
import com.repuestos.dto.LoginRequest;
import com.repuestos.dto.RegisterRequest;
import com.repuestos.dto.ResetPasswordRequest;
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

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String msg = authService.solicitarReset(req.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(msg, null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        String msg = authService.resetPassword(req.getToken(), req.getNuevaPassword());
        return ResponseEntity.ok(ApiResponse.ok(msg, null));
    }
}
