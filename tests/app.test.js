const app = require("../src/app");
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

    // Start in-memory database and drop after using
    beforeAll(async () => {
        await dbConnect();
        server = app.listen(0);
    });
    afterAll(async () => {
        await new Promise((resolve) => server.close(resolve));
        dbDisconnect();
    });

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
        expect(registerA1.status).toBe(201);
        expect(registerA1.body).toHaveProperty("user");
        const studentA1Id = registerA1.body.user._id;
        const loginA1 = await request(app)
            .post("/api/auth/login")
            .send({
                "username": "johncenna",
                "password": "johncenna"
            });
        expect(loginA1.status).toBe(200);
        expect(loginA1.body).toHaveProperty("token");
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
        expect(registerP1.status).toBe(201);
        expect(registerP1.body).toHaveProperty("user");
        const professorP1Id = registerP1.body.user._id;
        const loginP1 = await request(app)
            .post("/api/auth/login")
            .send({
                "username": "nguyenhongsac123",
                "password": "nguyenhongsac"
            });
        expect(loginP1.status).toBe(200);
        expect(loginP1.body).toHaveProperty("token");
        const tokenP1 = loginP1.body.token;


        // Step 3: Professor P1 create available time slots (T1 and T2)
        const slotT1 = await request(app)
            .post("/api/availability")
            .set("Authorization", `Bearer ${tokenP1}`)
            .send({
                "startTime" : "2025-05-11T09:00:00Z",
                "endTime" : "2025-05-11T10:00:00Z"
            });
        expect(slotT1.status).toBe(201);
        expect(slotT1.body).toHaveProperty('newSlot');
        slotT1Id = slotT1.body.newSlot._id;

        const slotT2 = await request(app)
            .post("/api/availability")
            .set("Authorization", `Bearer ${tokenP1}`)
            .send({
                "startTime" : "2025-05-11T13:00:00Z",
                "endTime" : "2025-05-11T14:00:00Z"
            });
        expect(slotT2.status).toBe(201);
        expect(slotT2.body).toHaveProperty('newSlot');
        slotT2Id = slotT2.body.newSlot._id;


        // Step 4: Student A1 views available time slots for Professor P1
        const availabilitySlotsP1 = await request(app)
            .get(`/api/availability/${professorP1Id}`)
            .set("Authorization", `Bearer ${tokenA1}`)
            // .send({});
        expect(availabilitySlotsP1.status).toBe(200);
        expect(availabilitySlotsP1.body).toHaveProperty("slots");
        expect(availabilitySlotsP1.body.slots.length).toBeGreaterThan(0);


        // Step 5: Student A1 books an appointment with Professor P1 for time T1
        const bookA1_P1 = await request(app)
            .post(`/api/appointment/${professorP1Id}`)
            .set("Authorization", `Bearer ${tokenA1}`)
            .send({ 
                slotId: slotT1Id,
                notes: "Ask some questions"
            });
        expect(bookA1_P1.status).toBe(201);
        expect(bookA1_P1.body).toHaveProperty('newAppointment');
        appointmentA1_P1_Id = bookA1_P1.body.newAppointment._id;
        

        // Step 6: Student A2 register and login to system
        const registerA2 = await request(app)
            .post("/api/auth/register")
            .send({
                "username": "rajeshsagar",
                "password": "rajeshsagar",
                "fullname": "Verma Rajesh Sagar",
                "role": "student",
                "phone": "0123756928",
                "age": 21
        });
        expect(registerA2.status).toBe(201);
        expect(registerA2.body).toHaveProperty("user");
        const studentA2Id = registerA2.body.user._id;
        const loginA2 = await request(app)
            .post("/api/auth/login")
            .send({
                "username": "rajeshsagar",
                "password": "rajeshsagar"
            });
        expect(loginA2.status).toBe(200);
        expect(loginA2.body).toHaveProperty("token");
        const tokenA2 = loginA2.body.token;


        // Step 7: Student A2 books an appointment with Professor P1 for time T2
        const bookA2_P1 = await request(app)
            .post(`/api/appointment/${professorP1Id}`)
            .set("Authorization", `Bearer ${tokenA2}`)
            .send({ 
                slotId: slotT2Id,
                notes: "Ask some questions"
            });
        expect(bookA2_P1.status).toBe(201);
        expect(bookA2_P1.body).toHaveProperty('newAppointment');
        appointmentA2_P1_Id = bookA2_P1.body.newAppointment._id;
        

        // Step 8: Professor P1 cancels appointment with Student A1
        // Get all appointment
        const appointmentsP1 = await request(app)
            .get("/api/appointment/")
            .set("Authorization", `Bearer ${tokenP1}`);
        expect(appointmentsP1.status).toBe(200);

        // Cancel appointment with student A1
        const appToCancel = appointmentsP1.body.appointments.find(
            (appointments) => appointments.studentId._id === studentA1Id
        );
        const cancelAppt = await request(app)
            .put(`/api/appointment/${appToCancel._id}`)
            .set("Authorization", `Bearer ${tokenP1}`)
            .send({
                status: "cancelled",
                notes: appToCancel.notes
            });
        expect(cancelAppt.status).toBe(200);
        expect(cancelAppt.body).toHaveProperty("updatedAppointment");


        // Step 9: Student A1 check appointments
        const appointmentsA1 = await request(app)
            .get("/api/appointment/")
            .set("Authorization", `Bearer ${tokenA1}`);
        expect(appointmentsA1.status).toBe(200);
        expect(appointmentsA1.body).toHaveProperty("appointments");
        const pendingApptA1 = appointmentsA1.body.appointments.find(
            (appointments) => appointments.status == "pending"
        );
        expect(pendingApptA1).toBeUndefined();
        
    });
});