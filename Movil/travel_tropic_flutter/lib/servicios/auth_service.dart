import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../configuracion/constants.dart';
import '../modelos/user.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  User? _currentUser;
  String? _token;
  bool _loading = true;

  User? get currentUser => _currentUser;
  String? get token => _token;
  bool get isLoggedIn => _currentUser != null;
  bool get isAdmin => _currentUser?.isAdmin ?? false;
  bool get isLoading => _loading;

  AuthService() {
    _loadFromPrefs();
  }

  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(AppConstants.keyAuthToken);
      final userJson = prefs.getString(AppConstants.keyLoggedUser);
      if (userJson != null && _token != null) {
        final map = jsonDecode(userJson);
        _currentUser = User(
          id: map['id'] ?? map['userId'] ?? '',
          nombre: map['username'] ?? map['nombre'] ?? '',
          email: map['email'] ?? '',
          rol: map['rol'] ?? 'cliente',
        );
      }
    } catch (e) {
      debugPrint('Error loading auth: $e');
    }
    _loading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final result = await ApiService.post('/login', {
      'email': email.toLowerCase().trim(),
      'password': password,
    });

    _token = result['token'];
    final userId = result['userId']?.toString() ?? result['id']?.toString() ?? '';
    final rol = (result['rol'] ?? 'cliente').toString().toLowerCase();

    _currentUser = User(
      id: userId,
      nombre: result['username'] ?? email,
      email: result['email'] ?? email,
      rol: rol,
    );

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.keyAuthToken, _token!);
    await prefs.setString(AppConstants.keyLoggedUser, jsonEncode({
      'id': userId,
      'userId': userId,
      'email': _currentUser!.email,
      'username': _currentUser!.nombre,
      'rol': rol,
      'isAdmin': rol == 'admin',
      'loggedAt': DateTime.now().toIso8601String(),
    }));

    notifyListeners();
  }

  Future<void> register({
    required String nombre,
    required String email,
    required String password,
    String? telefono,
    String pais = 'Colombia',
    String? ciudad,
    String? fechaNacimiento,
  }) async {
    await ApiService.post('/registrar', {
      'nombre': nombre.trim(),
      'email': email.toLowerCase().trim(),
      'password': password,
      if (telefono != null && telefono.isNotEmpty) 'telefono': telefono,
      'pais': pais,
      if (ciudad != null && ciudad.isNotEmpty) 'ciudad': ciudad,
      if (fechaNacimiento != null && fechaNacimiento.isNotEmpty)
        'fecha_nacimiento': fechaNacimiento,
    });
  }

  Future<void> logout() async {
    _currentUser = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.keyAuthToken);
    await prefs.remove(AppConstants.keyLoggedUser);
    notifyListeners();
  }

  void updateUser(User user) {
    _currentUser = user;
    notifyListeners();
  }
}
