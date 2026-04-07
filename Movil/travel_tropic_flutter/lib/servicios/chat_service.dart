import 'api_service.dart';

class ChatService {
  static Future<String> sendMessage(String message) async {
    final data = await ApiService.post('/chat', {
      'message': message,
    });
    return data['reply'] ?? 'No tengo respuesta en este momento.';
  }
}
