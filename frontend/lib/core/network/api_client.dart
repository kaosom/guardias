import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiClient {
  static String get baseUrl {
    final envUrl = dotenv.env['API_BASE_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl;
    }

    if (kIsWeb) {
      return 'http://localhost:3001';
    }
    return 'http://10.0.2.2:3001';
  }

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final cookie = prefs.getString('session_cookie');
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (cookie != null && cookie.isNotEmpty) {
      headers['cookie'] = cookie;
    }
    return headers;
  }

  static Future<void> _updateCookie(http.Response response) async {
    final setCookie = response.headers['set-cookie'];
    if (setCookie != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('session_cookie', setCookie);
    }
  }

  static Future<http.Response> get(String path) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: headers,
    );
    await _updateCookie(response);
    return response;
  }

  static Future<http.Response> post(String path, {String? body}) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: headers,
      body: body,
    );
    await _updateCookie(response);
    return response;
  }

  static Future<http.Response> put(String path, {String? body}) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: headers,
      body: body,
    );
    await _updateCookie(response);
    return response;
  }

  static Future<http.Response> delete(String path) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl$path'),
      headers: headers,
    );
    await _updateCookie(response);
    return response;
  }
}
