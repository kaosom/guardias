class VehicleRecord {
  final int id;
  final String plate;
  final String studentId;
  final String studentName;
  final String vehicleType;
  final String status; // 'inside' | 'outside'
  final bool hasHelmet;
  final int helmetCount;
  final List<dynamic> helmets;
  final String? vehicleDescription;
  final String? vehiclePhotoUrl;

  VehicleRecord({
    required this.id,
    required this.plate,
    required this.studentId,
    required this.studentName,
    required this.vehicleType,
    required this.status,
    required this.hasHelmet,
    required this.helmetCount,
    required this.helmets,
    this.vehicleDescription,
    this.vehiclePhotoUrl,
  });

  factory VehicleRecord.fromJson(Map<String, dynamic> json) {
    return VehicleRecord(
      id: json['id'],
      plate: json['plate'],
      studentId: json['studentId'],
      studentName: json['studentName'] ?? '',
      vehicleType: json['vehicleType'],
      status: json['status'],
      hasHelmet: json['hasHelmet'] ?? false,
      helmetCount: json['helmetCount'] ?? 0,
      helmets: json['helmets'] ?? [],
      vehicleDescription: json['vehicleDescription'],
      vehiclePhotoUrl: json['vehiclePhotoUrl'],
    );
  }
}
