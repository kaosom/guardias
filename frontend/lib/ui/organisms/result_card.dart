import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/models/vehicle_record.dart';
import '../../core/network/api_client.dart';
import '../molecules/grid_item.dart';

class ResultCard extends StatelessWidget {
  final VehicleRecord record;
  final VoidCallback? onEditUser;
  final VoidCallback? onEditVehicleInHeader;
  final bool showVehicleEditInHeader;

  const ResultCard({
    super.key,
    required this.record,
    this.onEditUser,
    this.onEditVehicleInHeader,
    this.showVehicleEditInHeader = false,
  });

  @override
  Widget build(BuildContext context) {
    final isInside = record.status == 'inside';
    final vehicleLabel = record.vehicleType == 'moto' ? 'Motocicleta' :
                         record.vehicleType == 'bici' ? 'Bicicleta' : 'Automóvil';
    final vehicleIcon = record.vehicleType == 'carro' ? LucideIcons.car : LucideIcons.bike;

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header (user info and status)
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 48, width: 48,
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(LucideIcons.user, color: Theme.of(context).primaryColor, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(record.studentName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(LucideIcons.graduationCap, size: 14, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(record.studentId, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey)),
                        ],
                      )
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isInside ? Theme.of(context).primaryColor.withOpacity(0.1) : Colors.grey.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Icon(isInside ? LucideIcons.arrowUpFromLine : LucideIcons.arrowDownToLine, size: 14, color: isInside ? Theme.of(context).primaryColor : Colors.grey),
                          const SizedBox(width: 6),
                          Text(isInside ? 'Dentro' : 'Fuera', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isInside ? Theme.of(context).primaryColor : Colors.grey)),
                        ],
                      ),
                    ),
                    if (onEditUser != null) ...[
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: onEditUser,
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          height: 32, width: 32,
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.secondary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(LucideIcons.pencil, size: 14, color: Theme.of(context).colorScheme.onSecondary),
                        ),
                      )
                    ]
                  ],
                ),
              ],
            ),
          ),
          
          Divider(height: 1, color: Theme.of(context).dividerColor.withOpacity(0.3)),
          
          // Triple data grid
          IntrinsicHeight(
            child: Row(
              children: [
                GridItem(icon: vehicleIcon, label: 'Tipo', value: vehicleLabel),
                VerticalDivider(width: 1, color: Theme.of(context).dividerColor.withOpacity(0.3)),
                GridItem(
                  label: 'Placa', 
                  value: record.plate, 
                  isMono: true,
                  headerAccessory: (showVehicleEditInHeader && onEditVehicleInHeader != null) ? InkWell(
                    onTap: onEditVehicleInHeader,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(color: Theme.of(context).colorScheme.secondary, shape: BoxShape.circle),
                      child: Icon(LucideIcons.pencil, size: 10, color: Theme.of(context).colorScheme.onSecondary),
                    ),
                  ) : null
                ),
                VerticalDivider(width: 1, color: Theme.of(context).dividerColor.withOpacity(0.3)),
                GridItem(
                  icon: LucideIcons.hardHat, 
                  label: 'Casco', 
                  valueText: record.hasHelmet ? 'Sí (${record.helmetCount})' : 'No',
                  valueColor: record.hasHelmet ? Colors.green : Colors.red,
                ),
              ],
            ),
          ),
          
          // Extra vehicle details
          if (record.vehicleDescription != null || record.vehiclePhotoUrl != null || (record.hasHelmet && record.helmets.isNotEmpty)) ...[
            Divider(height: 1, color: Theme.of(context).dividerColor.withOpacity(0.3)),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (record.vehiclePhotoUrl != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        record.vehiclePhotoUrl!.startsWith('http') 
                          ? record.vehiclePhotoUrl! 
                          : record.vehiclePhotoUrl!.startsWith('data:') 
                            ? record.vehiclePhotoUrl! 
                            : '${ApiClient.baseUrl}/api/photos/${record.vehiclePhotoUrl}',
                        height: 120,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(height: 120, color: Colors.grey.withOpacity(0.2), child: const Center(child: Icon(LucideIcons.image, color: Colors.grey))),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (record.vehicleDescription != null && record.vehicleDescription!.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(LucideIcons.fileText, size: 16, color: Colors.grey),
                          const SizedBox(width: 8),
                          Expanded(child: Text(record.vehicleDescription!, style: const TextStyle(fontSize: 14))),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (record.hasHelmet && record.helmets.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(LucideIcons.hardHat, size: 14, color: Colors.grey),
                        const SizedBox(width: 6),
                        const Text('Cascos registrados', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...record.helmets.asMap().entries.map((e) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.05),
                        border: Border.all(color: Colors.green.withOpacity(0.15)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Container(
                            height: 24, width: 24,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text('${e.key + 1}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green)),
                          ),
                          const SizedBox(width: 10),
                          Expanded(child: Text(e.value['description'] ?? '', style: const TextStyle(fontSize: 14))),
                        ],
                      ),
                    )),
                  ]
                ],
              ),
            ),
          ]
        ],
      ),
    );
  }
}
