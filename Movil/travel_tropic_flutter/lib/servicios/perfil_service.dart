import '../modelos/user.dart';
import 'api_service.dart';

class PerfilService {
  static Future<User> getPerfil(String userId) async {
    final data = await ApiService.get('/perfil/$userId');
    return User.fromJson(data);
  }

  static Future<User> updatePerfil({
    required String userId,
    required String nombre,
    String? telefono,
    String? pais,
    String? ciudad,
    String? fechaNacimiento,
  }) async {
    final data = await ApiService.put('/perfil/$userId', {
      'nombre': nombre,
      if (telefono != null) 'telefono': telefono,
      if (pais != null) 'pais': pais,
      if (ciudad != null) 'ciudad': ciudad,
      if (fechaNacimiento != null) 'fecha_nacimiento': fechaNacimiento,
    });
    return User.fromJson(data['user'] ?? data);
  }
}
