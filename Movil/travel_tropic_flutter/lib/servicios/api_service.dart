import 'dart:convert';
import 'package:http/http.dart' as http;
import '../configuracion/constants.dart';

class ApiService {
  static String get baseUrl => AppConstants.apiBaseUrl;

  static Map<String, String> get _jsonHeaders => {
    'Content-Type': 'application/json',
  };

  static Map<String, String> jsonHeadersWithToken(String token) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  static Future<Map<String, dynamic>> get(String path, {String? token}) async {
    final uri = Uri.parse('$baseUrl$path');
    final resp = await http.get(
      uri,
      headers: token != null ? jsonHeadersWithToken(token) : _jsonHeaders,
    );
    return _handleResponse(resp);
  }

  static Future<List<dynamic>> getList(String path, {String? token}) async {
    final uri = Uri.parse('$baseUrl$path');
    final resp = await http.get(
      uri,
      headers: token != null ? jsonHeadersWithToken(token) : _jsonHeaders,
    );
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      final body = jsonDecode(resp.body);
      if (body is List) return body;
      if (body is Map && body.containsKey('data')) return body['data'] as List;
      return [body];
    }
    throw ApiException(resp.statusCode, _extractError(resp));
  }

  static Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> body, {
    String? token,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final resp = await http.post(
      uri,
      headers: token != null ? jsonHeadersWithToken(token) : _jsonHeaders,
      body: jsonEncode(body),
    );
    return _handleResponse(resp);
  }

  static Future<Map<String, dynamic>> put(
    String path,
    Map<String, dynamic> body, {
    String? token,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final resp = await http.put(
      uri,
      headers: token != null ? jsonHeadersWithToken(token) : _jsonHeaders,
      body: jsonEncode(body),
    );
    return _handleResponse(resp);
  }

  static Future<Map<String, dynamic>> delete(String path, {String? token}) async {
    final uri = Uri.parse('$baseUrl$path');
    final resp = await http.delete(
      uri,
      headers: token != null ? jsonHeadersWithToken(token) : _jsonHeaders,
    );
    return _handleResponse(resp);
  }

  static Map<String, dynamic> _handleResponse(http.Response resp) {
    final body = resp.body.isNotEmpty ? jsonDecode(resp.body) : <String, dynamic>{};
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      if (body is Map<String, dynamic>) return body;
      return {'data': body};
    }
    throw ApiException(resp.statusCode, _extractError(resp));
  }

  static String _extractError(http.Response resp) {
    try {
      final body = jsonDecode(resp.body);
      if (body is Map) {
        return body['error']?.toString() ??
            body['message']?.toString() ??
            'Error desconocido';
      }
    } catch (_) {}
    return 'Error ${resp.statusCode}';
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}
