
export const SAMPLE_WEBHOOKS = [
  {
    name: "Stripe: Payment Succeeded",
    description: "Evento de pagamento aprovado do Stripe",
    json: JSON.stringify({
      "id": "evt_1M5j2i2eZvKYlo2C0",
      "object": "event",
      "api_version": "2022-11-15",
      "created": 1678892345,
      "data": {
        "object": {
          "id": "pi_3M5j2i2eZvKYlo2C1",
          "object": "payment_intent",
          "amount": 2000,
          "currency": "usd",
          "payment_method_details": {
            "card": {
              "brand": "visa",
              "last4": "4242"
            },
            "type": "card"
          },
          "receipt_email": "jenny.rosen@example.com"
        }
      },
      "type": "payment_intent.succeeded"
    }, null, 2),
    instructions: "Extraia o ID do evento, o email do recibo, o valor (converta de centavos para dólares), a moeda e a bandeira do cartão."
  },
  {
    name: "Shopify: Order Created",
    description: "Novo pedido realizado no e-commerce",
    json: JSON.stringify({
      "id": 820982911946154508,
      "email": "bob.norman@hostmail.com",
      "created_at": "2023-10-02T14:45:00-04:00",
      "total_price": "199.00",
      "currency": "BRL",
      "line_items": [
        {
          "id": 866550311766439020,
          "title": "Tênis de Corrida Pro",
          "price": "199.00",
          "quantity": 1
        }
      ],
      "customer": {
        "first_name": "Bob",
        "last_name": "Norman",
        "default_address": {
          "city": "Rio de Janeiro",
          "country": "Brazil"
        }
      }
    }, null, 2),
    instructions: "Extraia o ID do pedido, nome completo do cliente (concatene first e last name), email, cidade, nome do produto principal e valor total."
  },
  {
    name: "GitHub: Push Event",
    description: "Commit realizado em um repositório",
    json: JSON.stringify({
      "ref": "refs/heads/main",
      "repository": {
        "id": 1296269,
        "full_name": "octocat/Hello-World",
        "owner": {
          "login": "octocat",
          "id": 1
        },
        "html_url": "https://github.com/octocat/Hello-World"
      },
      "pusher": {
        "name": "octocat",
        "email": "octocat@github.com"
      },
      "commits": [
        {
          "id": "b6568db1bc1dcdfd754caa13d3506e75a9b9b5a3",
          "message": "Update README.md fixed typo",
          "timestamp": "2023-10-01T12:00:00-07:00",
          "url": "https://github.com/octocat/Hello-World/commit/b6568db1bc1dcdfd754caa13d3506e75a9b9b5a3",
          "author": {
            "name": "Monalisa Octocat",
            "email": "support@github.com"
          }
        }
      ]
    }, null, 2),
    instructions: "Pegue o nome do repositório, o nome de quem fez o push, a mensagem do último commit e o link HTML do repositório."
  }
];
