class Reserva {
  final String id;
  final String userId;
  final String destinationId;
  final String estado;
  final String? fechaReserva;
  final String? creadoEn;
  final String? destinoNombre;
  final String? destinoImagen;
  final double? destinoPrecio;
  final String? destinoPais;
  final String? destinoCiudad;
  final String? usuarioNombre;
  final String? usuarioEmail;

  Reserva({
    required this.id,
    required this.userId,
    required this.destinationId,
    required this.estado,
    this.fechaReserva,
    this.creadoEn,
    this.destinoNombre,
    this.destinoImagen,
    this.destinoPrecio,
    this.destinoPais,
    this.destinoCiudad,
    this.usuarioNombre,
    this.usuarioEmail,
  });

  String get estadoDisplay {
    switch (estado.toLowerCase()) {
      case 'confirmed':
      case 'confirmada':
        return 'Confirmada';
      case 'cancelled':
      case 'cancelada':
        return 'Cancelada';
      case 'pending':
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  }

  bool get isPending =>
      estado.toLowerCase() == 'pending' || estado.toLowerCase() == 'pendiente';
  bool get isConfirmed =>
      estado.toLowerCase() == 'confirmed' || estado.toLowerCase() == 'confirmada';
  bool get isCancelled =>
      estado.toLowerCase() == 'cancelled' || estado.toLowerCase() == 'cancelada';

  factory Reserva.fromJson(Map<String, dynamic> json) {
    final destino = json['Destinos'] ?? json['destino'] ?? {};
    final usuario = json['Usuarios'] ?? json['usuario'] ?? {};
    String? imagen;
    if (destino['Destino_ui'] != null && destino['Destino_ui'] is List) {
      final imgs = (destino['Destino_ui'] as List)
          .where((m) => m['tipo'] == 'image')
          .toList();
      if (imgs.isNotEmpty) imagen = imgs.first['url'];
    }
    imagen ??= json['destino_imagen'];

    return Reserva(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      destinationId: json['destination_id']?.toString() ?? '',
      estado: json['estado'] ?? 'Pendiente',
      fechaReserva: json['fecha_reserva'],
      creadoEn: json['creado_en'],
      destinoNombre: destino['nombre'] ?? json['destino_nombre'],
      destinoImagen: imagen,
      destinoPrecio: _toDouble(destino['precio'] ?? json['destino_precio']),
      destinoPais: destino['pais'] ?? json['destino_pais'],
      destinoCiudad: destino['ciudad'] ?? json['destino_ciudad'],
      usuarioNombre: usuario['nombre'] ?? json['usuario_nombre'],
      usuarioEmail: usuario['email'] ?? json['usuario_email'],
    );
  }

  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is double) return v;
    if (v is int) return v.toDouble();
    return double.tryParse(v.toString());
  }
}
