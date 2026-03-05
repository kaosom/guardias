import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../core/network/api_client.dart';

class SessionUser {
  final int id;
  final String email;
  final String role;
  final String fullName;
  final int? gate;
  final String? locationName;

  SessionUser({
    required this.id,
    required this.email,
    required this.role,
    required this.fullName,
    this.gate,
    this.locationName,
  });

  factory SessionUser.fromJson(Map<String, dynamic> json) {
    return SessionUser(
      id: json['id'],
      email: json['email'],
      role: json['role'],
      fullName: json['fullName'],
      gate: json['gate'],
      locationName: json['locationName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'role': role,
      'fullName': fullName,
      'gate': gate,
      'locationName': locationName,
    };
  }
}

class AuthState {
  final SessionUser? user;
  final bool isLoading;

  AuthState({this.user, this.isLoading = false});

  AuthState copyWith({SessionUser? user, bool? isLoading}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

// Riverpod 3: Notifier en vez de StateNotifier
class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _init();
    return AuthState(isLoading: true);
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('session_user');
    if (userJson != null) {
      try {
        final user = SessionUser.fromJson(jsonDecode(userJson));
        state = AuthState(user: user, isLoading: false);
        _refresh();
      } catch (_) {
        state = AuthState(isLoading: false);
      }
    } else {
      state = AuthState(isLoading: false);
    }
  }

  Future<void> _refresh() async {
    try {
      final res = await ApiClient.get('/api/auth/session');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['user'] != null) {
          final user = SessionUser.fromJson(data['user']);
          await setUser(user);
        } else {
          await logout();
        }
      } else {
        await logout();
      }
    } catch (_) {
      // Error silencioso en el refresh de fondo
    }
  }

  Future<void> setUser(SessionUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('session_user', jsonEncode(user.toJson()));
    state = AuthState(user: user, isLoading: false);
  }

  Future<void> logout() async {
    state = AuthState(user: state.user, isLoading: true);
    try {
      await ApiClient.post('/api/auth/logout');
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('session_user');
    await prefs.remove('session_cookie');
    state = AuthState(user: null, isLoading: false);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
