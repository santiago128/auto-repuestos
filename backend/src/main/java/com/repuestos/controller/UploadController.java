package com.repuestos.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<?> subirImagen(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El archivo está vacío"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Solo se permiten imágenes"));
        }

        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);

            String extension = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String filename = UUID.randomUUID() + extension;
            Path destino = dir.resolve(filename);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/" + filename;
            return ResponseEntity.ok(Map.of("url", url, "mensaje", "Imagen subida exitosamente"));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("mensaje", "Error al guardar la imagen: " + e.getMessage()));
        }
    }
}
