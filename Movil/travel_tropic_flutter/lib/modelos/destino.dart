class Destino {
  final String id;
  final String nombre;
  final String? pais;
  final String? ciudad;
  final String? descripcion;
  final String? clima;
  final double? precio;
  final double? latitud;
  final double? longitud;
  final bool activo;
  final List<DestinoMedia> media;
  final double? rating;
  final String? dificultad;
  final String? duracion;
  final String? categoria;

  Destino({
    required this.id,
    required this.nombre,
    this.pais,
    this.ciudad,
    this.descripcion,
    this.clima,
    this.precio,
    this.latitud,
    this.longitud,
    this.activo = true,
    this.media = const [],
    this.rating,
    this.dificultad,
    this.duracion,
    this.categoria,
  });

  String get imageUrl {
    final img = media.where((m) => m.tipo == 'image').toList();
    if (img.isNotEmpty) return img.first.url;
    return '';
  }

  String get precioFormateado {
    if (precio == null) return 'Consultar';
    final p = precio!.toInt();
    return '\$${_formatNumber(p)} COP';
  }

  static String _formatNumber(int n) {
    final s = n.toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write('.');
      buf.write(s[i]);
    }
    return buf.toString();
  }

  factory Destino.fromJson(Map<String, dynamic> json) {
    List<DestinoMedia> mediaList = [];
    if (json['Destino_ui'] != null && json['Destino_ui'] is List) {
      mediaList = (json['Destino_ui'] as List)
          .map((m) => DestinoMedia.fromJson(m))
          .toList();
    }

    return Destino(
      id: json['id']?.toString() ?? '',
      nombre: json['nombre'] ?? '',
      pais: json['pais'],
      ciudad: json['ciudad'],
      descripcion: json['descripcion'],
      clima: json['clima'],
      precio: _toDouble(json['precio']),
      latitud: _toDouble(json['latitud']),
      longitud: _toDouble(json['longitud']),
      activo: json['activo'] ?? true,
      media: mediaList,
      rating: _toDouble(json['rating']),
      dificultad: json['dificultad'],
      duracion: json['duracion'],
      categoria: json['categoria'],
    );
  }

  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is double) return v;
    if (v is int) return v.toDouble();
    return double.tryParse(v.toString());
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre': nombre,
    'pais': pais,
    'ciudad': ciudad,
    'descripcion': descripcion,
    'clima': clima,
    'precio': precio,
    'latitud': latitud,
    'longitud': longitud,
    'activo': activo,
  };
}

class DestinoMedia {
  final String id;
  final String tipo;
  final String url;
  final int? orden;

  DestinoMedia({
    required this.id,
    required this.tipo,
    required this.url,
    this.orden,
  });

  factory DestinoMedia.fromJson(Map<String, dynamic> json) {
    return DestinoMedia(
      id: json['id']?.toString() ?? '',
      tipo: json['tipo'] ?? 'image',
      url: json['url'] ?? '',
      orden: json['orden'],
    );
  }
}
