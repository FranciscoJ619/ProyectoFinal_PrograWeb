package com.replayclub.api.exception;

import com.replayclub.api.dto.ComunDtos.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/** Convierte todas las excepciones en respuestas JSON con el código HTTP correcto. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---------- 400 Bad Request ----------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errores.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        ex.getBindingResult().getGlobalErrors()
                .forEach(ge -> errores.putIfAbsent(ge.getObjectName(), ge.getDefaultMessage()));
        return construir(HttpStatus.BAD_REQUEST, "Hay campos con errores, revisa el formulario", req, errores);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> validacionParametros(HandlerMethodValidationException ex, HttpServletRequest req) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getParameterValidationResults().forEach(r -> r.getResolvableErrors().forEach(e ->
                errores.putIfAbsent(r.getMethodParameter().getParameterName(), e.getDefaultMessage())));
        return construir(HttpStatus.BAD_REQUEST, "Parámetros inválidos", req, errores);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> violacion(ConstraintViolationException ex, HttpServletRequest req) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v -> errores.putIfAbsent(v.getPropertyPath().toString(), v.getMessage()));
        return construir(HttpStatus.BAD_REQUEST, "Parámetros inválidos", req, errores);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> jsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return construir(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es válido o tiene valores no permitidos", req, null);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<ErrorResponse> parametro(Exception ex, HttpServletRequest req) {
        return construir(HttpStatus.BAD_REQUEST, "Parámetro inválido o faltante: " + ex.getMessage(), req, null);
    }

    // ---------- 401 Unauthorized ----------

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> credenciales(BadCredentialsException ex, HttpServletRequest req) {
        return construir(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos", req, null);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponse> deshabilitado(DisabledException ex, HttpServletRequest req) {
        return construir(HttpStatus.UNAUTHORIZED, "Tu cuenta está desactivada. Contacta al administrador", req, null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> autenticacion(AuthenticationException ex, HttpServletRequest req) {
        return construir(HttpStatus.UNAUTHORIZED, "Necesitas iniciar sesión", req, null);
    }

    // ---------- 403 Forbidden ----------

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> accesoDenegado(AccessDeniedException ex, HttpServletRequest req) {
        return construir(HttpStatus.FORBIDDEN, "No tienes permisos para realizar esta acción", req, null);
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ErrorResponse> accesoDenegadoNegocio(AccesoDenegadoException ex, HttpServletRequest req) {
        return construir(HttpStatus.FORBIDDEN, ex.getMessage(), req, null);
    }

    // ---------- 404 Not Found ----------

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> noEncontrado(RecursoNoEncontradoException ex, HttpServletRequest req) {
        return construir(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> rutaNoEncontrada(NoResourceFoundException ex, HttpServletRequest req) {
        return construir(HttpStatus.NOT_FOUND, "La ruta solicitada no existe", req, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> metodo(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return construir(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP no permitido en esta ruta", req, null);
    }

    // ---------- 422 Unprocessable Entity ----------

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponse> negocio(ReglaNegocioException ex, HttpServletRequest req) {
        return construir(HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage(), req, ex.getErrores());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integridad(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Violación de integridad: {}", ex.getMostSpecificCause().getMessage());
        return construir(HttpStatus.UNPROCESSABLE_CONTENT,
                "La operación no es posible porque el registro está relacionado con otros datos", req, null);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> archivoGrande(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return construir(HttpStatus.UNPROCESSABLE_CONTENT, "La imagen excede el tamaño máximo de 5 MB", req,
                Map.of("archivo", "La imagen excede el tamaño máximo de 5 MB"));
    }

    // ---------- 500 Internal Server Error ----------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> general(Exception ex, HttpServletRequest req) {
        log.error("Error no controlado en {}", req.getRequestURI(), ex);
        return construir(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado. Intenta de nuevo más tarde", req, null);
    }

    private ResponseEntity<ErrorResponse> construir(HttpStatus status, String mensaje, HttpServletRequest req,
                                                    Map<String, String> errores) {
        ErrorResponse body = new ErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(),
                mensaje, req.getRequestURI(), errores);
        return ResponseEntity.status(status).body(body);
    }
}
