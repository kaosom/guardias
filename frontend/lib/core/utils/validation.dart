class ValidationResult {
  final bool isValid;
  final String? error;

  ValidationResult({required this.isValid, this.error});
}

final Set<String> _validFirstLetters = {
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
};

final Set<String> _excludedLetters = {'I', 'Ñ', 'O', 'Q'};

final Set<String> _validLetters = {
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
};

bool isValidPueblaLetter(String letter, int position) {
  final upper = letter.toUpperCase();

  if (_excludedLetters.contains(upper)) {
    return false;
  }

  if (position == 0) {
    return _validFirstLetters.contains(upper);
  }

  return _validLetters.contains(upper);
}

bool validatePueblaPlate(String plate) {
  final clean = plate.replaceAll(RegExp(r'[^A-Za-z0-9]'), '').toUpperCase();

  if (clean.length < 6 || clean.length > 7) {
    return false;
  }

  final letters = clean.substring(0, 3);
  final numbers = clean.substring(3);

  if (letters.length != 3) {
    return false;
  }

  if (numbers.length < 3 || numbers.length > 4) {
    return false;
  }

  if (!RegExp(r'^\d+$').hasMatch(numbers)) {
    return false;
  }

  for (int i = 0; i < letters.length; i++) {
    if (!isValidPueblaLetter(letters[i], i)) {
      return false;
    }
  }

  return true;
}

String formatPueblaPlate(String value) {
  final clean = value.replaceAll(RegExp(r'[^A-Za-z0-9]'), '').toUpperCase();

  if (clean.isEmpty) return '';

  final letters = clean.length >= 3 ? clean.substring(0, 3) : clean;
  final numbers = clean.length > 3
      ? clean.substring(3, clean.length > 7 ? 7 : clean.length)
      : '';

  if (numbers.isEmpty) {
    return letters;
  }

  return '$letters-$numbers';
}

bool validateMatricula(String matricula) {
  final digits = matricula.replaceAll(RegExp(r'\D'), '');
  return digits.length == 9;
}

String formatMatricula(String value) {
  final digits = value.replaceAll(RegExp(r'\D'), '');
  return digits.length > 9 ? digits.substring(0, 9) : digits;
}

ValidationResult validatePlateWithMessage(String plate) {
  final clean = plate.replaceAll(RegExp(r'[^A-Za-z0-9]'), '').toUpperCase();

  if (clean.isEmpty) {
    return ValidationResult(isValid: false, error: 'Placa requerida');
  }

  if (clean.length < 6) {
    return ValidationResult(
      isValid: false,
      error: 'Placa incompleta (mínimo 6 caracteres)',
    );
  }

  if (clean.length > 7) {
    return ValidationResult(
      isValid: false,
      error: 'Placa demasiado larga (máximo 7 caracteres)',
    );
  }

  final letters = clean.substring(0, 3);
  final numbers = clean.substring(3);

  if (letters.length != 3) {
    return ValidationResult(isValid: false, error: 'Se requieren 3 letras');
  }

  final firstLetter = letters[0];
  if (!_validFirstLetters.contains(firstLetter)) {
    return ValidationResult(
      isValid: false,
      error: 'Primera letra debe ser T o U (Puebla)',
    );
  }

  for (int i = 0; i < letters.length; i++) {
    final letter = letters[i];
    if (_excludedLetters.contains(letter)) {
      return ValidationResult(
        isValid: false,
        error: 'Letra $letter no permitida (NOM-001-SCT-2-2016)',
      );
    }
    if (!_validLetters.contains(letter)) {
      return ValidationResult(isValid: false, error: 'Letra $letter no válida');
    }
  }

  if (!RegExp(r'^\d+$').hasMatch(numbers)) {
    return ValidationResult(isValid: false, error: 'Números no válidos');
  }

  if (numbers.length < 3 || numbers.length > 4) {
    return ValidationResult(
      isValid: false,
      error: 'Se requieren 3 o 4 números',
    );
  }

  return ValidationResult(isValid: true);
}

ValidationResult validateMatriculaWithMessage(String matricula) {
  final digits = matricula.replaceAll(RegExp(r'\D'), '');

  if (digits.isEmpty) {
    return ValidationResult(isValid: false, error: 'Matrícula requerida');
  }

  if (digits.length < 9) {
    return ValidationResult(
      isValid: false,
      error: 'Matrícula incompleta (${digits.length}/9 dígitos)',
    );
  }

  if (digits.length > 9) {
    return ValidationResult(
      isValid: false,
      error: 'Matrícula demasiado larga (máximo 9 dígitos)',
    );
  }

  return ValidationResult(isValid: true);
}
