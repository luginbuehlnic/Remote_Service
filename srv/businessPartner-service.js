const cds = require("@sap/cds");
const req = require("express/lib/request");

class BusinessPartner extends cds.ApplicationService {
    async init(){
        const BusinessPartnerAPI = await cds.connect.to("API_BUSINESS_PARTNER");

        const A_BusinessPartner = BusinessPartnerAPI.entities;
        const BusinessPartner = this.entities;

        this.on("READ", A_BusinessPartner, (req) => {
            return BusinessPartnerAPI.run(req.query);
        })
    }
}