import { Card } from "@/components/ui/card";
import { AddClientForm } from "@/components/dashboard/add-client-form";
import { getOwnerAgencyClients } from "@/lib/agency";

export default async function AgencyPage() {
  const { clients, isAgency, demo } = await getOwnerAgencyClients();

  return (
    <div>
      <h1 className="text-display-md text-wise-ink">Clients</h1>
      <p className="mt-2 text-wise-body">
        Every business you run through ReviewLabs, grouped with its outlets. Add another client
        to manage multiple businesses from one account.
      </p>

      {demo && (
        <Card className="mt-6 bg-wise-canvas-soft p-6 text-sm text-wise-mute">
          Connect Supabase to manage real clients here.
        </Card>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {clients.map((client) => (
          <Card key={client.businessId} className="p-6">
            <p className="font-semibold text-wise-ink">{client.businessName}</p>
            {client.outlets.length === 0 ? (
              <p className="mt-2 text-sm text-wise-mute">No outlets yet.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1">
                {client.outlets.map((outlet) => (
                  <li key={outlet.id} className="text-sm text-wise-body">
                    {outlet.name}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
        {clients.length === 0 && !demo && (
          <Card className="bg-wise-canvas-soft p-6 text-sm text-wise-mute">No businesses yet.</Card>
        )}
      </div>

      {!demo && (
        <Card className="mt-6 p-6">
          <p className="mb-4 font-semibold text-wise-ink">Add a client</p>
          <AddClientForm showConsequenceCopy={!isAgency} />
        </Card>
      )}
    </div>
  );
}
