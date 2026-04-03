export interface GooglePlace {
  id: string
  displayName: { text: string; languageCode: string }
  formattedAddress: string
  nationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
}

interface GooglePlacesResponse {
  places?: GooglePlace[]
}

export async function searchPlaces(
  segmento: string,
  cidade: string,
  estado: string
): Promise<GooglePlace[] | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        textQuery: `${segmento} em ${cidade} ${estado}`,
        maxResultCount: 20,
        languageCode: "pt-BR",
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data: GooglePlacesResponse = await res.json()
    return data.places ?? []
  } catch {
    return null
  }
}
