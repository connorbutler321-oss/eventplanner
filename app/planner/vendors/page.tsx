import { getAttendees } from "@/lib/data/attendees";
import { getRegistrationsForAttendee } from "@/lib/data/registrations";
import { getEventById } from "@/lib/data/events";
import { Card } from "@/components/ui/Card";
import { RegistrationStatusBadge } from "@/components/ui/Badge";

export default async function PlannerVendorsPage() {
  const attendees = getAttendees();

  return (
    <div className="ef-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-lu-purple-900">Vendors &amp; Attendees</h1>
        <p className="mt-1 text-sm text-gray-600">Everyone who has registered for one of your events.</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-lu-purple-50/60 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Business / Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Registrations</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => {
                const regs = getRegistrationsForAttendee(a.id);
                return (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-lu-purple-50/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-lu-purple-900">{a.businessName || a.name}</p>
                      {a.businessName && <p className="text-xs text-gray-500">{a.name}</p>}
                    </td>
                    <td className="px-4 py-3">{a.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {a.email}
                      <br />
                      {a.phone}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {regs.map((r) => {
                          const event = getEventById(r.eventId);
                          return (
                            <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs">
                              {event?.name ?? "Unknown"} <RegistrationStatusBadge status={r.status} />
                            </span>
                          );
                        })}
                        {regs.length === 0 && <span className="text-xs text-gray-400">No registrations</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
