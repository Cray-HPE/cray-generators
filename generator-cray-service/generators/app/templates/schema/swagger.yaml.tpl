---
swagger: "2.0"
host: "<%= serviceName %>:<%= servicePort %>"
basePath: "<%= serviceBasePath %>"
info:
  title: "<%= serviceName %>"
  description: "OpenAPI for <%= serviceName %>"
  version: "0.0.1"
paths:
  <% if (hasWebFrontend) { %>
  '<%= servicePathsPrefix %>/':
    get:
      summary: Web Frontend
      tags: [ cli_ignore ]
      produces:
        - text/html
      responses:
        '200':
          description: "Web frontend for <%= serviceName %>"
  <% } %>
  '<%= servicePathsPrefix %>/versions':
    get:
      summary: Returns supported versions
      tags: [ Versions ]
      produces:
        - application/json
      responses:
        '200':
          description: Version response
          schema:
            $ref: "#/definitions/Versions"
  '<%= servicePathsPrefix %>/items':
    get:
      summary: List items
      tags: [ Items ]
      produces:
        - application/json
      responses:
        '200':
          description: List items
          schema:
            type: array
            items:
              $ref: "#/definitions/Item"
    post:
      summary: Create item
      tags: [ Items ]
      parameters:
        - in: body
          name: item
          description: The item to create
          schema:
            $ref: "#/definitions/Item"
      consumes:
        - application/json
      produces:
        - application/json
      responses:
        '201':
          description: Item created
          schema:
            $ref: "#/definitions/Item"
  '<%= servicePathsPrefix %>/items/{id}':
    parameters:
      - in: path
        name: id
        type: string
        required: true
        description: Item ID
    get:
      summary: Get item details
      tags: [ Items ]
      responses:
        '200':
          description: Item details
          schema:
            $ref: "#/definitions/Item"
        '404':
          description: Item not found
          schema:
            $ref: "#/definitions/ProblemDetails"
    patch:
      summary: Update item
      tags: [ Items ]
      parameters:
        - in: body
          name: item
          schema:
            $ref: "#/definitions/Item"
      responses:
        '200':
          description: Item details
          schema:
            $ref: "#/definitions/Item"
        '404':
          description: Item not found
          schema:
            $ref: "#/definitions/ProblemDetails"
    delete:
      summary: Delete item
      tags: [ Items ]
      responses:
        '204':
          description: Item deleted
        '404':
          description: Item not found
          schema:
            $ref: "#/definitions/ProblemDetails"
definitions:
  Item:
    type: object
    properties:
      id:
        type: string
        format: uuid
        readOnly: true
      value:
        type: string
  Versions:
    type: object
    properties:
      versions:
        type: array
        items:
          type: object
          properties:
            id:
              type: string
              example: "v1/"
            major:
              type: integer
              example: 1
            minor:
              type: integer
              example: 0
            patch:
              type: integer
              example: 0
          required: [id, major, minor, patch]
    required: [ versions ]
  ProblemDetails:
    type: object
    properties:
      type:
        type: string
        format: uri
        example: "https://cray.com/problem_details/not_found"
      title:
        type: string
        example: "Not found"
      status:
        type: integer
        example: 404
      detail:
        type: string
        example: "The item doesn't exist. It may have been deleted."
      instance:
        type: string
        format: uri
        example: "https://sms/apis/example/errors/12345"