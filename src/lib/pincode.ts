export async function lookupPincode(pin: string): Promise<{ city: string; state: string } | null> {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
  const data = await res.json();
  const record = data?.[0];
  if (record?.Status === "Success" && record.PostOffice?.length) {
    const po = record.PostOffice[0];
    return { city: po.District ?? "", state: po.State ?? "" };
  }
  return null;
}
