'use client';

import { AgencyWithDistance } from '@/lib/types';
import { formatDistance, formatPhone } from '@/lib/format';

interface AgencyCardProps {
  agency: AgencyWithDistance;
  rank?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function AgencyCard({ agency, rank, isSelected = false, onClick }: AgencyCardProps) {
  const phone1 = formatPhone(agency.telefono_1);
  const phone2 = formatPhone(agency.telefono_2);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${
        isSelected
          ? 'border-[#7C1034] ring-2 ring-[#7C1034]/20'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className={`px-4 py-3 ${isSelected ? 'bg-[#7C1034]' : 'bg-[#7C1034]/80'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {rank && (
              <span className="bg-white/25 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                {rank}
              </span>
            )}
            <h3 className="text-white font-semibold text-sm leading-tight">{agency.sede}</h3>
          </div>
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
            {formatDistance(agency.distanceKm)}
          </span>
        </div>
        <p className={`text-white/80 text-xs mt-1 ${rank ? 'pl-8' : ''}`}>{agency.tipo_de_servicio}</p>
      </div>

      {/* Show details only when selected */}
      {isSelected && (
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <div>
              <p className="text-sm text-gray-700">{agency.full_address}</p>
              <p className="text-xs text-gray-500 mt-0.5">{agency.colonia}, {agency.alcaldia}</p>
            </div>
          </div>

          {agency.horario_de_atencion_horas && (
            <div className="flex items-start gap-3">
              <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-700">{agency.horario_de_atencion_horas}</p>
                {agency.dias_de_atencion && (
                  <p className="text-xs text-gray-500 mt-0.5">{agency.dias_de_atencion}</p>
                )}
              </div>
            </div>
          )}

          {(phone1 || phone2) && (
            <div className="flex items-start gap-3">
              <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div className="flex flex-wrap gap-2">
                {phone1 && (
                  <a href={`tel:${phone1}`} className="text-sm text-[#7C1034] hover:underline" onClick={(e) => e.stopPropagation()}>
                    {phone1}{agency.extension_1 && agency.extension_1 !== 'S/N' ? ` ext. ${agency.extension_1}` : ''}
                  </a>
                )}
                {phone2 && (
                  <a href={`tel:${phone2}`} className="text-sm text-[#7C1034] hover:underline" onClick={(e) => e.stopPropagation()}>
                    {phone2}{agency.extension_2 && agency.extension_2 !== 'S/N' ? ` ext. ${agency.extension_2}` : ''}
                  </a>
                )}
              </div>
            </div>
          )}

          {agency.correo_electronico && agency.correo_electronico !== 'S/C' && (
            <div className="flex items-start gap-3">
              <svg className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${agency.correo_electronico}`} className="text-sm text-[#7C1034] hover:underline" onClick={(e) => e.stopPropagation()}>
                {agency.correo_electronico}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
