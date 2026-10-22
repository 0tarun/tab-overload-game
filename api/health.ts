interface ApiRequest {
  method?: string
}

interface ApiResponse {
  status(code: number): ApiResponse
  json(value: unknown): void
}

export default function healthHandler(_request: ApiRequest, response: ApiResponse) {
  response.status(200).json({ status: 'ok' })
}
