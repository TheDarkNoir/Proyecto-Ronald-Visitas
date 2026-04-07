class User {
  final String id;
  final String nombre;
  final String email;
  final String rol;
  final String? telefono;
  final String? pais;
  final String? ciudad;
  final String? fechaNacimiento;
  final String? createdAt;

  User({
    required this.id,
    required this.nombre,
    required this.email,
    required this.rol,
    this.telefono,
    this.pais,
    this.ciudad,
    this.fechaNacimiento,
    this.createdAt,
  });

  bool get isAdmin => rol.toLowerCase() == 'admin';

  String get initials {
    final parts = nombre.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return nombre.isNotEmpty ? nombre[0].toUpperCase() : 'U';
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      nombre: json['nombre'] ?? json['username'] ?? '',
      email: json['email'] ?? '',
      rol: json['rol'] ?? 'cliente',
      telefono: json['telefono'],
      pais: json['pais'],
      ciudad: json['ciudad'],
      fechaNacimiento: json['fecha_nacimiento'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre': nombre,
    'email': email,
    'rol': rol,
    'telefono': telefono,
    'pais': pais,
    'ciudad': ciudad,
    'fecha_nacimiento': fechaNacimiento,
    'created_at': createdAt,
  };

  User copyWith({
    String? nombre,
    String? telefono,
    String? pais,
    String? ciudad,
    String? fechaNacimiento,
  }) {
    return User(
      id: id,
      nombre: nombre ?? this.nombre,
      email: email,
      rol: rol,
      telefono: telefono ?? this.telefono,
      pais: pais ?? this.pais,
      ciudad: ciudad ?? this.ciudad,
      fechaNacimiento: fechaNacimiento ?? this.fechaNacimiento,
      createdAt: createdAt,
    );
  }
}
