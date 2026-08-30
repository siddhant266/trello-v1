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
let sectionId = "";
let section2Id = "";
let issueId = "";
let commentId = "";
let membershipId = "";
let invitationId = "";

// Second user for invitation tests
const email2 = `invited${Date.now()}@example.com`;
const password2 = "password456";
let token2 = "";
let userId2 = "";


// -----------------------------
// Response types
// -----------------------------

type SigninResponse = {
    token: string;
};

type SignupResponse = {
    user: { id: string; email: string };
};

type OrganizationResponse = {
    organization: { id: string };
};

type OrganizationsResponse = {
    organizations: unknown[];
};

type BoardResponse = {
    board: { id: string };
};

type SectionResponse = {
    section: { id: string };
};

type IssueResponse = {
    issue: { id: string };
};

type CommentResponse = {
    comment: { id: string };
};

type MembersResponse = {
    members: Array<{ id: string; userId: string; role: string }>;
};

type InvitationResponse = {
    invitation: { id: string };
};

type InvitationsResponse = {
    invitations: Array<{ id: string }>;
};


// -----------------------------
// Request helper
// -----------------------------

async function request(
    method: string,
    path: string,
    body?: object,
    useToken?: string
) {
    const t = useToken ?? token;

    return fetch(`${baseUrl}${path}`, {
        method,

        headers: {
            "Content-Type": "application/json",

            ...(t && {
                Authorization: `Bearer ${t}`,
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
        expect(organizationId).toBeDefined();
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
        expect(boardId).toBeDefined();
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


    // -------------------------
    // SECTION
    // -------------------------

    test("Create Section", async () => {

        const response = await request(
            "POST",
            `/api/boards/${boardId}/sections`,
            {
                title: "To Do",
            }
        );

        const data = await response.json() as SectionResponse;

        console.log(
            "Create Section:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        expect(data.section).toBeDefined();
        sectionId = data.section.id;
        expect(sectionId).toBeDefined();
    });


    test("Create Second Section", async () => {

        const response = await request(
            "POST",
            `/api/boards/${boardId}/sections`,
            {
                title: "In Progress",
            }
        );

        const data = await response.json() as SectionResponse;

        console.log(
            "Create Second Section:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        section2Id = data.section.id;
    });


    test("Get Sections", async () => {

        const response = await request(
            "GET",
            `/api/boards/${boardId}/sections`
        );

        const data = await response.json();

        console.log(
            "Get Sections:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Update Section", async () => {

        const response = await request(
            "PUT",
            `/api/sections/${sectionId}`,
            {
                title: "Backlog",
            }
        );

        const data = await response.json();

        console.log(
            "Update Section:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    // -------------------------
    // ISSUE
    // -------------------------

    test("Create Issue", async () => {

        const response = await request(
            "POST",
            `/api/boards/${boardId}/sections/${sectionId}/issues`,
            {
                title: "Fix login bug",
                description: "Users cannot login with email",
            }
        );

        const data = await response.json() as IssueResponse;

        console.log(
            "Create Issue:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        expect(data.issue).toBeDefined();
        issueId = data.issue.id;
        expect(issueId).toBeDefined();
    });


    test("Get Issues", async () => {

        const response = await request(
            "GET",
            `/api/boards/${boardId}/issues`
        );

        const data = await response.json();

        console.log(
            "Get Issues:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Get Issue by ID", async () => {

        const response = await request(
            "GET",
            `/api/issues/${issueId}`
        );

        const data = await response.json();

        console.log(
            "Get Issue:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Update Issue", async () => {

        const response = await request(
            "PUT",
            `/api/issues/${issueId}`,
            {
                title: "Fix login bug (updated)",
            }
        );

        const data = await response.json();

        console.log(
            "Update Issue:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Move Issue to another Section", async () => {

        const response = await request(
            "PATCH",
            `/api/issues/${issueId}/move`,
            {
                sectionId: section2Id,
                order: 1000,
            }
        );

        const data = await response.json();

        console.log(
            "Move Issue:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    // -------------------------
    // COMMENTS
    // -------------------------

    test("Create Comment", async () => {

        const response = await request(
            "POST",
            `/api/issues/${issueId}/comments`,
            {
                comment: "This is a test comment",
            }
        );

        const data = await response.json() as CommentResponse;

        console.log(
            "Create Comment:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        expect(data.comment).toBeDefined();
        commentId = data.comment.id;
        expect(commentId).toBeDefined();
    });


    test("Update Comment", async () => {

        const response = await request(
            "PUT",
            `/api/comments/${commentId}`,
            {
                comment: "This is an updated comment",
            }
        );

        const data = await response.json();

        console.log(
            "Update Comment:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Delete Comment", async () => {

        const response = await request(
            "DELETE",
            `/api/comments/${commentId}`
        );

        const data = await response.json();

        console.log(
            "Delete Comment:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    // -------------------------
    // MEMBERSHIP
    // -------------------------

    test("Get Members", async () => {

        const response = await request(
            "GET",
            `/api/organizations/${organizationId}/members`
        );

        const data = await response.json() as MembersResponse;

        console.log(
            "Get Members:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
        expect(data.members).toBeDefined();
        expect(data.members.length).toBeGreaterThan(0);

        // Store the membership ID for later tests
        const myMembership = data.members.find(
            (m) => m.role === "ADMIN"
        );
        if (myMembership) {
            membershipId = myMembership.id;
        }
    });


    // -------------------------
    // INVITATIONS
    // -------------------------

    test("Signup second user (for invitation test)", async () => {

        const response = await request(
            "POST",
            "/api/auth/signup",
            {
                email: email2,
                password: password2,
            }
        );

        const data = await response.json() as SignupResponse;

        console.log(
            "Signup2:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        userId2 = data.user.id;
    });


    test("Signin second user", async () => {

        const response = await request(
            "POST",
            "/api/auth/signin",
            {
                email: email2,
                password: password2,
            }
        );

        const data = await response.json() as SigninResponse;

        console.log(
            "Signin2:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
        token2 = data.token;
    });


    test("Send Invitation (admin invites existing user)", async () => {

        const response = await request(
            "POST",
            `/api/organizations/${organizationId}/invitations`,
            {
                email: email2,
            }
        );

        const data = await response.json() as InvitationResponse;

        console.log(
            "Send Invitation:",
            response.status,
            data
        );

        expect(response.status).toBe(201);
        expect(data.invitation).toBeDefined();
        invitationId = data.invitation.id;
    });


    test("Get My Invitations (as second user)", async () => {

        const response = await request(
            "GET",
            "/api/invitations",
            undefined,
            token2
        );

        const data = await response.json() as InvitationsResponse;

        console.log(
            "Get My Invitations:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
        expect(data.invitations).toBeDefined();
        expect(data.invitations.length).toBeGreaterThan(0);
    });


    test("Accept Invitation (as second user)", async () => {

        const response = await request(
            "PATCH",
            `/api/invitations/${invitationId}`,
            {
                action: "ACCEPT",
            },
            token2
        );

        const data = await response.json();

        console.log(
            "Accept Invitation:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Send Invitation to non-existing user", async () => {

        const nonExistingEmail = `nonexistent${Date.now()}@example.com`;

        const response = await request(
            "POST",
            `/api/organizations/${organizationId}/invitations`,
            {
                email: nonExistingEmail,
            }
        );

        const data = await response.json();

        console.log(
            "Send Invitation (non-existing user):",
            response.status,
            data
        );

        expect(response.status).toBe(201);
    });


    // -------------------------
    // CLEANUP / DELETE
    // -------------------------

    test("Delete Issue", async () => {

        const response = await request(
            "DELETE",
            `/api/issues/${issueId}`
        );

        const data = await response.json();

        console.log(
            "Delete Issue:",
            response.status,
            data
        );

        expect(response.status).toBe(200);
    });


    test("Delete Section", async () => {

        const response = await request(
            "DELETE",
            `/api/sections/${sectionId}`
        );

        const data = await response.json();

        console.log(
            "Delete Section:",
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


    test("Delete Organization", async () => {

        const response = await request(
            "DELETE",
            `/api/organizations/${organizationId}`
        );

        const data = await response.json();

        console.log(
            "Delete Organization:",
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