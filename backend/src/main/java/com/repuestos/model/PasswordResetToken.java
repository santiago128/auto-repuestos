package com.repuestos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private String token;

    @Column(name = "expira_en")
    private LocalDateTime expiraEn;

    private Boolean usado = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
