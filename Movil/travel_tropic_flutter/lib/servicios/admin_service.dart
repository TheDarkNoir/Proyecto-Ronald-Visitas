import 'api_service.dart';

class AdminService {
  static Future<Map<String, dynamic>> getPanel(String adminId) async {
    return ApiService.get('/admin/panel?adminId=$adminId');
  }

  // --- Destinos CRUD ---
  static Future<Map<String, dynamic>> crearDestino(Map<String, dynamic> data) async {
    return ApiService.post('/admin/destinos', data);
  }

  static Future<Map<String, dynamic>> actualizarDestino(
      String id, Map<String, dynamic> data) async {
    return ApiService.put('/admin/destinos/$id', data);
  }

  static Future<Map<String, dynamic>> eliminarDestino(String id) async {
    return ApiService.delete('/admin/destinos/$id');
  }

  // --- Usuarios CRUD ---
  static Future<Map<String, dynamic>> crearUsuario(Map<String, dynamic> data) async {
    return ApiService.post('/admin/usuarios', data);
  }

  static Future<Map<String, dynamic>> actualizarUsuario(
      String id, Map<String, dynamic> data) async {
    return ApiService.put('/admin/usuarios/$id', data);
  }

  static Future<Map<String, dynamic>> eliminarUsuario(String id) async {
    return ApiService.delete('/admin/usuarios/$id');
  }

  // --- Reservaciones ---
  static Future<Map<String, dynamic>> cambiarEstadoReserva(
      String reservaId, String estado) async {
    return ApiService.put('/admin/reservas/$reservaId/status', {
      'status': estado,
    });
  }
}
