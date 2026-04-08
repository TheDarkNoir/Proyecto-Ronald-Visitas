import 'package:flutter/foundation.dart';

class AppConstants {
  // Puedes sobreescribir la URL con:
  // flutter run --dart-define=API_BASE_URL=http://TU_IP:5502
  static const String _apiBaseUrlOverride = String.fromEnvironment('API_BASE_URL');

  static String get apiBaseUrl {
    if (_apiBaseUrlOverride.isNotEmpty) {
      return _apiBaseUrlOverride;
    }

    if (kIsWeb) {
      return 'http://localhost:5502';
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:5502';
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
      case TargetPlatform.linux:
      case TargetPlatform.windows:
      case TargetPlatform.fuchsia:
        return 'http://localhost:5502';
    }
  }

  // Supabase (solo referencia, la conexión real va por el backend Express)
  static const String supabaseUrl = 'https://qyhbrwzzexcwpupydlnq.supabase.co';

  static const String appName = 'Tropical Travel';
  static const String appVersion = '1.0.0';

  // Keys para SharedPreferences
  static const String keyAuthToken = 'authToken';
  static const String keyLoggedUser = 'loggedUser';

  // Roles
  static const String roleAdmin = 'admin';
  static const String roleCliente = 'cliente';
}
