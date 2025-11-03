// Simple test to verify hospital API endpoints
const testHospitalAPI = async () => {
  try {
    // Test create hospital
    const createResponse = await fetch("http://localhost:5000/api/hospitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Hospital",
        type: "General",
        city: "TestCity",
        details: "Test hospital for verification",
      }),
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log("Hospital created successfully:", created);

      // Test list hospitals
      const listResponse = await fetch("http://localhost:5000/api/hospitals");
      if (listResponse.ok) {
        const list = await listResponse.json();
        console.log("Hospitals list:", list);
      } else {
        console.error("Failed to list hospitals:", listResponse.status);
      }
    } else {
      console.error("Failed to create hospital:", createResponse.status);
      const error = await createResponse.text();
      console.error("Error details:", error);
    }
  } catch (error) {
    console.error("API test failed:", error);
  }
};

testHospitalAPI();
