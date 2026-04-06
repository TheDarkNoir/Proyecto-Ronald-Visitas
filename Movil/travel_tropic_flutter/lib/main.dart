import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'configuracion/theme.dart';
import 'servicios/auth_service.dart';
import 'pantallas/autenticacion/login_screen.dart';
import 'pantallas/cliente/client_shell.dart';
import 'pantallas/admin/admin_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthService(),
      child: const TropicalTravelApp(),
    ),
  );
}

class TropicalTravelApp extends StatelessWidget {
  const TropicalTravelApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tropical Travel',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    if (auth.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (!auth.isLoggedIn) {
      return const LoginScreen();
    }

    if (auth.isAdmin) {
      return const AdminShell();
    }

    return const ClientShell();
  }
}

