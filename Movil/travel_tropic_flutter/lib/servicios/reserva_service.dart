import '../modelos/reserva.dart';
import 'api_service.dart';

class ReservaService {
  static Future<List<Reserva>> getMisReservas(String userId) async {
    final list = await ApiService.getList('/reservas/$userId');
    return list.map((r) => Reserva.fromJson(r)).toList();
  }

  static Future<Map<String, dynamic>> crearReserva({
    required String userId,
    required String destinationId,
  }) async {
    return ApiService.post('/reservas', {
      'userId': userId,
      'destinationId': destinationId,
    });
  }

  static Future<Map<String, dynamic>> cambiarEstado({
    required String reservaId,
    required String nuevoEstado,
  }) async {
    return ApiService.put('/reservas/$reservaId/status', {
      'status': nuevoEstado,
    });
  }

  static Future<Map<String, dynamic>> cancelarReserva(String reservaId) async {
    return ApiService.put('/reservas/$reservaId/cancel', {});
  }
}
