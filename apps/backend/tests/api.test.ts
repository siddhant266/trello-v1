import {
    afterAll,
    describe,
    expect,
    test,
} from "bun:test";

import app from "../app";


// -----------------------------
// Test server
// -----------------------------

const server = app.listen(0);

const address = server.address();

if (!address || typeof address === "string") {
    throw new Error("Could not start test server");
}

const port = address.port;

const baseUrl = `http://localhost:${port}`;


// -----------------------------
// Test data
// -----------------------------

let token = "";

const email = `test${Date.now()}@example.com`;
const password = "password123";

let organizationId = "";
let boardId = "";


// -----------------------------
// Response types
// -----------------------------

type SigninResponse = {
    token: string;
};

type OrganizationResponse = {
    organization: {
        id: string;
    };
};

type OrganizationsResponse = {
    organizations: unknown[];
};

type BoardResponse = {
    board: {
        id: string;
    };
};


// -----------------------------
// Request helper
// -----------------------------

async function request(
    method: string,
    path: string,
    body?: object
) {
    return fetch(`${baseUrl}${path}`, {
        method,

        headers: {
            "Content-Type": "application/json",

            ...(token && {
                Authorization: `Bearer ${token}`,
            }),
        },

        ...(body && {
            body: JSON.stringify(body),
        }),
    });
}


// -----------------------------
// Tests
// -----------------------------

describe("Trello Backend API", () => {

    // -------------------------
    // AUTH
    // -------------------------

    test("Signup", async () => {

        const response = await request(
            "POST",
            "/api/auth/signup",
            {
                email,
                password,
            }
        );

        const data = await response.json();

        console.log("Signup:", response.status, data);

        expect(response.status).toBe(201);
    });


    test("Signin", async () => {

        const response = await request(
            "POST",
            "/api/auth/signin",
            {
                email,
                password,
            }
        );

        const data = await response.json() as SigninResponse;

        console.log("Signin:", response.status, data);

        expect(response.status).toBe(200);

        expect(data.token).toBeDefined();

        token = data.token;
    });


    // -------------------------
    // ORGANIZATION
    // -------------------------

    test("Create Organization", async () => {

        const response = await request(
            "POST",
            "/api/organizations",
            {
                name: "Test Organization",
                description: "Testing organization",
            }
        );

        const data = await response.json() as OrganizationResponse;

        console.log(
            "Create Organization:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        expect(data.organization).toBeDefined();
        organizationId = data.organization.id;
    });


    test("Get Organizations", async () => {

        const response = await request(
            "GET",
            "/api/organizations"
        );

        const data =
            await response.json() as OrganizationsResponse;

        console.log(
            "Get Organizations:",
            response.status,
            data
        );

        expect(response.status).toBe(200);

        expect(data.organizations).toBeDefined();
    });


    // -------------------------
    // BOARD
    // -------------------------

    test("Create Board", async () => {

        const response = await request(
            "POST",
            `/api/organizations/${organizationId}/boards`,
            {
                name: "Test Board",
                description: "Testing board",
            }
        );

        const data = await response.json() as BoardResponse;

        console.log(
            "Create Board:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        expect(data.board).toBeDefined();
        boardId = data.board.id;
    });


    test("Get Boards", async () => {

        const response = await request(
            "GET",
            `/api/organizations/${organizationId}/boards`
        );

        const data = await response.json();

        console.log(
            "Get Boards:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Update Board", async () => {

        const response = await request(
            "PUT",
            `/api/organizations/${organizationId}/boards/${boardId}`,
            {
                name: "Updated Test Board",
            }
        );

        const data = await response.json();

        console.log(
            "Update Board:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Delete Board", async () => {

        const response = await request(
            "DELETE",
            `/api/organizations/${organizationId}/boards/${boardId}`
        );

        const data = await response.json();

        console.log(
            "Delete Board:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });

});


// -----------------------------
// Close server after tests
// -----------------------------

afterAll(() => {
    server.close();
});