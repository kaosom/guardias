import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart' as enc;

class ParsedQrPayload {
  final String searchTerm;
  final String? action;

  ParsedQrPayload({required this.searchTerm, this.action});
}

String? _safeBase64Decode(String raw) {
  final trimmed = raw.trim();
  if (trimmed.isEmpty) return null;
  try {
    return utf8.decode(base64Decode(trimmed));
  } catch (_) {
    return null;
  }
}

bool _isBase64Like(String s) {
  final trimmed = s.trim();
  if (trimmed.isEmpty) return false;
  return RegExp(r'^[A-Za-z0-9+/]+=*$').hasMatch(trimmed) && trimmed.length % 4 != 1;
}

String? _extractSearchTermFromObject(Map<String, dynamic> obj) {
  final matricula = obj['matricula'];
  if (matricula is String && matricula.trim().isNotEmpty) return matricula.trim();
  final studentId = obj['studentId'];
  if (studentId is String && studentId.trim().isNotEmpty) return studentId.trim();
  final plate = obj['plate'];
  if (plate is String && plate.trim().isNotEmpty) return plate.trim();
  return null;
}

String? _extractAction(Map<String, dynamic> obj) {
  final a = obj['action'];
  if (a == 'entry' || a == 'exit') return a as String;
  return null;
}

ParsedQrPayload? parseInstitutionalQrSync(String raw) {
  if (raw.trim().isEmpty) return null;

  String decoded = raw.trim();

  if (_isBase64Like(raw)) {
    final fromB64 = _safeBase64Decode(raw);
    if (fromB64 != null) decoded = fromB64;
  }

  try {
    final obj = jsonDecode(decoded) as Map<String, dynamic>;
    final searchTerm = _extractSearchTermFromObject(obj);
    if (searchTerm != null) {
      return ParsedQrPayload(
        searchTerm: searchTerm,
        action: _extractAction(obj),
      );
    }
  } catch (_) {
    // ignorar error de json parsing
  }

  return null;
}

Future<ParsedQrPayload?> parseInstitutionalQr(String raw, {String secret = ""}) async {
  final syncResult = parseInstitutionalQrSync(raw);
  if (syncResult != null) return syncResult;

  if (secret.isEmpty) return null;

  final trimmed = raw.trim();
  if (!_isBase64Like(trimmed)) return null;

  try {
    final rawBytes = base64Decode(trimmed);
    if (rawBytes.length < 12 + 16) return null;

    final iv = rawBytes.sublist(0, 12);
    final ciphertext = rawBytes.sublist(12, rawBytes.length - 16);
    final mac = rawBytes.sublist(rawBytes.length - 16);

    final keyBytes = sha256.convert(utf8.encode(secret)).bytes;
    
    final keyObj = enc.Key(Uint8List.fromList(keyBytes));
    final ivObj = enc.IV(Uint8List.fromList(iv));

    final encrypter = enc.Encrypter(
      enc.AES(keyObj, mode: enc.AESMode.gcm)
    );

    final combined = Uint8List.fromList([...ciphertext, ...mac]);
    final decrypted = encrypter.decrypt(enc.Encrypted(combined), iv: ivObj);
    
    final obj = jsonDecode(decrypted) as Map<String, dynamic>;
    final searchTerm = _extractSearchTermFromObject(obj);
    if (searchTerm != null) {
      return ParsedQrPayload(
        searchTerm: searchTerm,
        action: _extractAction(obj),
      );
    }
  } catch (_) {
    // Si falla desencriptar o parsear, devuelve null
  }
  return null;
}
