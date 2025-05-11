const app = require("../app");
const request = require("supertest");
const { dbConnect, dbDisconnect } = require("./test.config");

describe("E2E Test", function() {
    /*
        1. Student A1 authenticates to access the system.
        2. Professor P1 authenticates to access the system.
        3. Professor P1 specifies which time slots he is free for appointments.
        4. Student A1 views available time slots for Professor P1.
        5. Student A1 books an appointment with Professor P1 for time T1.
        6. Student A2 authenticates to access the system.
        7. Student A2 books an appointment with Professor P1 for time T2.
        8. Professor P1 cancels the appointment with Student A1.
        9. Student A1 checks their appointments and realizes they do not have any pending appointments.
    */

    // Start in-memory database
    beforeAll(async () =>  dbConnect());
    afterAll(async () => dbDisconnect());

    let A1Token, A2Token, P1Token;

    it("Full user flow", async function() {
        // Step 1: Student A1 register and login
        const registerA1 = await request(app)
            .post("/api/auth/register")
            .send({
                "username": "johncenna",
                "password": "johncenna",
                "fullname": "John Cenna",
                "role": "student",
                "phone": "0123756928",
                "age": 21
        });
        const studentA1Id = registerA1.body.user._id;
        const loginA1 = await request(app)
            .post("/api/auth/login")
            .send({
                "username": "johncenna",
                "password": "johncenna"
            });
        const tokenA1 = loginA1.body.token;

        // Step 2: Professor P1 register and login
        const registerP1 = await request(app)
            .post("/api/auth/register")
            .send({
                "username": "nguyenhongsac123",
                "password": "nguyenhongsac",
                "fullname": "Nguyen Hong Sac",
                "role": "professor",
                "phone": "0383890203",
                "age": 22
            });
        const professorP1Id = registerP1.body.user._id;
        const loginP1 = await request(app)
            .post("/api/auth/login")
            .send({
                "username": "nguyenhongsac123",
                "password": "nguyenhongsac"
            });
        const tokenP1 = loginP1.body.token;

        // Step 3: Professor P1 create available time slots (T1 and T2)
        const slotT1 = await request(app)
            .post("/api/availability")
            .set("Authorization", `Bearer ${tokenP1}`)
            .send({
                "startTime" : "2025-05-11T9:00:00Z",
                "endTime" : "2025-05-11T10:00:00Z"
            });
        slotT1Id = slotT1.body._id;

        const slotT2 = await request(app)
            .post("/api/availability")
            .set("Authorization", `Bearer ${tokenP1}`)
            .send({
                "startTime" : "2025-05-11T13:00:00Z",
                "endTime" : "2025-05-11T14:00:00Z"
            });
        slotT2Id = slotT2.body._id;


        // Step 4: Student A1 views available time slots for Professor P1
        const availabilitySlotsP1 = await request(app)
            .get(`/api/availability/${professorP1Id}`)
            .set("Authorization", `Bearer ${tokenA1}`)
            // .send({});
        expect(availabilitySlotsP1.status).toBe(200);

        // Step 5: Student A1 books an appointment with Professor P1 for time T1
        const bookA1_P1 = await request(app)
            .post("/api/")
        
        // Step 6: Student A2 register and login to system
        const registerA2 = await request(app)
            .post("/api/auth/register")
            .send({
                "username": "johncenna",
                "password": "johncenna",
                "fullname": "John Cenna",
                "role": "student",
                "phone": "0123756928",
                "age": 21
        });
        const studentA2Id = registerA2.body.user._id;
        const loginA2 = await request(app)
            .post("/api/auth/login")
            .send({
                "username": "johncenna",
                "password": "johncenna"
            });
        const tokenA2 = loginA2.body.token;


        // Step 7: Student A2 books an appointment with Professor P1 for time T2
        // Step 8: Professor P1 cancels appointment with Student A1
        // Step 9: Student A1 check apps
    });
});