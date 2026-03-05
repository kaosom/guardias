class AppLocation {
  final int id;
  final String code;
  final String name;
  final int gates;

  const AppLocation({
    required this.id,
    required this.code,
    required this.name,
    required this.gates,
  });
}

int getMaxGatesForLocation(dynamic locationId) {
  if (locationId == null || locationId == '') return 15;
  try {
    final loc = appLocations.firstWhere(
      (l) =>
          l.id ==
          (locationId is int ? locationId : int.parse(locationId.toString())),
    );
    return loc.gates;
  } catch (e) {
    return 15;
  }
}

int getMaxGatesForLocationName(String? locationName) {
  if (locationName == null || locationName.trim().isEmpty) return 15;
  try {
    final loc = appLocations.firstWhere((l) => l.name == locationName.trim());
    return loc.gates;
  } catch (e) {
    return 15;
  }
}

const List<AppLocation> appLocations = [
  AppLocation(id: 1, code: 'CU', name: 'Ciudad Universitaria (CU)', gates: 15),
  AppLocation(
    id: 2,
    code: 'CU2',
    name: 'Ciudad Universitaria 2 (CU2)',
    gates: 10,
  ),
  AppLocation(
    id: 3,
    code: 'AREA_CENTRO_HISTORICO',
    name: 'Área Centro Histórico (Carolino y sedes del centro)',
    gates: 8,
  ),
  AppLocation(id: 4, code: 'AREA_SALUD', name: 'Área de la Salud', gates: 6),
  AppLocation(
    id: 5,
    code: 'AREA_ANGELOPOLIS_CCU',
    name: 'Área Angelópolis / Complejo Cultural Universitario (CCU)',
    gates: 5,
  ),

  AppLocation(
    id: 10,
    code: 'CRC_TECAMACHALCO',
    name: 'Complejo Regional Centro · Tecamachalco',
    gates: 3,
  ),
  AppLocation(
    id: 11,
    code: 'CRC_SAN_JOSE_CHIAPA',
    name: 'Complejo Regional Centro · San José Chiapa',
    gates: 2,
  ),
  AppLocation(
    id: 12,
    code: 'CRC_ACAJETE',
    name: 'Complejo Regional Centro · Acajete',
    gates: 2,
  ),
  AppLocation(
    id: 13,
    code: 'CRC_CIUDAD_SERDAN',
    name: 'Complejo Regional Centro · Ciudad Serdán',
    gates: 3,
  ),
  AppLocation(
    id: 14,
    code: 'CRC_ACATZINGO',
    name: 'Complejo Regional Centro · Acatzingo',
    gates: 2,
  ),
  AppLocation(
    id: 15,
    code: 'CRC_TEPEACA',
    name: 'Complejo Regional Centro · Tepeaca',
    gates: 3,
  ),

  AppLocation(
    id: 20,
    code: 'CRM_ATLIXCO',
    name: 'Complejo Regional Mixteca · Atlixco',
    gates: 3,
  ),
  AppLocation(
    id: 21,
    code: 'CRM_CHIAUTLA',
    name: 'Complejo Regional Mixteca · Chiautla de Tapia',
    gates: 2,
  ),
  AppLocation(
    id: 22,
    code: 'CRM_IZUCAR',
    name: 'Complejo Regional Mixteca · Izúcar de Matamoros',
    gates: 4,
  ),

  AppLocation(
    id: 30,
    code: 'CRN_TEZIUTLAN',
    name: 'Complejo Regional Nororiental · Teziutlán',
    gates: 4,
  ),
  AppLocation(
    id: 31,
    code: 'CRN_ZACAPOAXTLA',
    name: 'Complejo Regional Nororiental · Zacapoaxtla',
    gates: 3,
  ),
  AppLocation(
    id: 32,
    code: 'CRN_CUETZALAN',
    name: 'Complejo Regional Nororiental · Cuetzalan',
    gates: 2,
  ),
  AppLocation(
    id: 33,
    code: 'CRN_LIBRES',
    name: 'Complejo Regional Nororiental · Libres',
    gates: 3,
  ),

  AppLocation(
    id: 40,
    code: 'CRNTE_HUAUCHINANGO',
    name: 'Complejo Regional Norte · Huauchinango',
    gates: 3,
  ),
  AppLocation(
    id: 41,
    code: 'CRNTE_CHIGNAHUAPAN',
    name: 'Complejo Regional Norte · Chignahuapan',
    gates: 2,
  ),
  AppLocation(
    id: 42,
    code: 'CRNTE_ZACATLAN',
    name: 'Complejo Regional Norte · Zacatlán',
    gates: 2,
  ),
  AppLocation(
    id: 43,
    code: 'CRNTE_TETELA',
    name: 'Complejo Regional Norte · Tetela de Ocampo',
    gates: 2,
  ),

  AppLocation(
    id: 50,
    code: 'CRS_TEHUACAN',
    name: 'Complejo Regional Sur · Tehuacán',
    gates: 4,
  ),

  AppLocation(
    id: 60,
    code: 'MAGDALENA_TLATLAUQUITEPEC',
    name: 'Unidad regional La Magdalena Tlatlauquitepec',
    gates: 2,
  ),

  AppLocation(
    id: 70,
    code: 'PREP_EMILIANO_ZAPATA',
    name: 'Preparatoria Emiliano Zapata',
    gates: 2,
  ),
  AppLocation(
    id: 71,
    code: 'PREP_2_OCTUBRE',
    name: 'Preparatoria 2 de Octubre de 1968',
    gates: 2,
  ),
  AppLocation(
    id: 72,
    code: 'PREP_BENITO_JUAREZ',
    name: 'Preparatoria Benito Juárez García',
    gates: 2,
  ),
  AppLocation(
    id: 73,
    code: 'PREP_ENRIQUE_CABRERA_URBANA',
    name: 'Preparatoria Enrique Cabrera Barroso Urbana',
    gates: 2,
  ),
  AppLocation(
    id: 74,
    code: 'PREP_ENRIQUE_CABRERA_REGIONAL',
    name: 'Preparatoria Enrique Cabrera Barroso Regional',
    gates: 2,
  ),
  AppLocation(
    id: 75,
    code: 'PREP_ALFONSO_CALDERON',
    name: 'Preparatoria Alfonso Calderón Moreno',
    gates: 2,
  ),
  AppLocation(
    id: 76,
    code: 'PREP_LAZARO_CARDENAS',
    name: 'Preparatoria Lázaro Cárdenas del Río',
    gates: 2,
  ),
  AppLocation(
    id: 77,
    code: 'PREP_BI_5MAYO',
    name: 'Bachillerato Internacional 5 de Mayo',
    gates: 2,
  ),
  AppLocation(
    id: 78,
    code: 'PREP_SIMON_BOLIVAR',
    name: 'Preparatoria Regional Simón Bolívar',
    gates: 1,
  ),
  AppLocation(
    id: 79,
    code: 'PREP_ATLIXCO',
    name: 'Preparatoria Regional de Atlixco',
    gates: 1,
  ),
  AppLocation(
    id: 80,
    code: 'PREP_TEHUACAN',
    name: 'Preparatoria Regional de Tehuacán',
    gates: 1,
  ),
  AppLocation(
    id: 81,
    code: 'PREP_TECAMACHALCO',
    name: 'Preparatoria Regional de Tecamachalco',
    gates: 1,
  ),
  AppLocation(
    id: 82,
    code: 'PREP_ZACAPOAXTLA',
    name: 'Preparatoria Regional de Zacapoaxtla',
    gates: 1,
  ),
  AppLocation(
    id: 83,
    code: 'PREP_CHIGNAHUAPAN',
    name: 'Preparatoria Regional de Chignahuapan',
    gates: 1,
  ),
  AppLocation(
    id: 84,
    code: 'PREP_HUAUCHINANGO',
    name: 'Preparatoria Regional de Huauchinango',
    gates: 1,
  ),
  AppLocation(
    id: 85,
    code: 'PREP_IZUCAR',
    name: 'Preparatoria Regional de Izúcar de Matamoros',
    gates: 1,
  ),
];
