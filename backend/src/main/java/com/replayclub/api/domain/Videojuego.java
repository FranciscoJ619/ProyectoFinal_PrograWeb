package com.replayclub.api.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Un ejemplar físico publicado por un usuario. */
@Entity
@Table(name = "videojuegos")
public class Videojuego {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false, length = 600)
    private String descripcion;

    @Column(name = "anio_lanzamiento")
    private Integer anioLanzamiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_fisico", nullable = false, length = 20)
    private EstadoFisico estadoFisico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Modalidad modalidad;

    @Column(name = "precio_venta", precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "dias_max_prestamo")
    private Integer diasMaxPrestamo;

    @Column(name = "condiciones_prestamo", length = 400)
    private String condicionesPrestamo;

    @Column(name = "disponible_desde")
    private LocalDate disponibleDesde;

    @Column(nullable = false, length = 120)
    private String ubicacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_publicacion", nullable = false, length = 20)
    private EstadoPublicacion estadoPublicacion;

    @Column(name = "calificacion_promedio", nullable = false, precision = 3, scale = 2)
    private BigDecimal calificacionPromedio = BigDecimal.ZERO;

    @Column(name = "total_resenas", nullable = false)
    private int totalResenas;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plataforma_id")
    private Plataforma plataforma;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "propietario_id")
    private Usuario propietario;

    // Relación N:M. LAZY + BatchSize: los géneros de toda una página se cargan en una sola consulta (evita N+1).
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "videojuego_generos",
            joinColumns = @JoinColumn(name = "videojuego_id"),
            inverseJoinColumns = @JoinColumn(name = "genero_id"))
    @BatchSize(size = 50)
    private Set<Genero> generos = new LinkedHashSet<>();

    @OneToMany(mappedBy = "videojuego", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    @BatchSize(size = 50)
    private List<ImagenVideojuego> imagenes = new ArrayList<>();

    @Column(name = "fecha_publicacion", nullable = false, updatable = false)
    private LocalDateTime fechaPublicacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    void prePersist() {
        LocalDateTime ahora = LocalDateTime.now();
        if (fechaPublicacion == null) fechaPublicacion = ahora;
        fechaActualizacion = ahora;
    }

    @PreUpdate
    void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    public void reemplazarImagenes(List<String> urls) {
        imagenes.clear();
        if (urls == null) return;
        int orden = 0;
        for (String url : urls) {
            ImagenVideojuego img = new ImagenVideojuego();
            img.setUrl(url);
            img.setOrden(orden++);
            img.setVideojuego(this);
            imagenes.add(img);
        }
    }

    public String getPortadaUrl() {
        return imagenes.isEmpty() ? null : imagenes.get(0).getUrl();
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getAnioLanzamiento() { return anioLanzamiento; }
    public void setAnioLanzamiento(Integer anioLanzamiento) { this.anioLanzamiento = anioLanzamiento; }
    public EstadoFisico getEstadoFisico() { return estadoFisico; }
    public void setEstadoFisico(EstadoFisico estadoFisico) { this.estadoFisico = estadoFisico; }
    public Modalidad getModalidad() { return modalidad; }
    public void setModalidad(Modalidad modalidad) { this.modalidad = modalidad; }
    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    public Integer getDiasMaxPrestamo() { return diasMaxPrestamo; }
    public void setDiasMaxPrestamo(Integer diasMaxPrestamo) { this.diasMaxPrestamo = diasMaxPrestamo; }
    public String getCondicionesPrestamo() { return condicionesPrestamo; }
    public void setCondicionesPrestamo(String condicionesPrestamo) { this.condicionesPrestamo = condicionesPrestamo; }
    public LocalDate getDisponibleDesde() { return disponibleDesde; }
    public void setDisponibleDesde(LocalDate disponibleDesde) { this.disponibleDesde = disponibleDesde; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public EstadoPublicacion getEstadoPublicacion() { return estadoPublicacion; }
    public void setEstadoPublicacion(EstadoPublicacion estadoPublicacion) { this.estadoPublicacion = estadoPublicacion; }
    public BigDecimal getCalificacionPromedio() { return calificacionPromedio; }
    public void setCalificacionPromedio(BigDecimal calificacionPromedio) { this.calificacionPromedio = calificacionPromedio; }
    public int getTotalResenas() { return totalResenas; }
    public void setTotalResenas(int totalResenas) { this.totalResenas = totalResenas; }
    public Plataforma getPlataforma() { return plataforma; }
    public void setPlataforma(Plataforma plataforma) { this.plataforma = plataforma; }
    public Usuario getPropietario() { return propietario; }
    public void setPropietario(Usuario propietario) { this.propietario = propietario; }
    public Set<Genero> getGeneros() { return generos; }
    public List<ImagenVideojuego> getImagenes() { return imagenes; }
    public LocalDateTime getFechaPublicacion() { return fechaPublicacion; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
}
