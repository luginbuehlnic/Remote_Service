class BusinessPartner extends cds.ApplicationService {
    async init(){
        const bupa = await cds.connect.to("API_BUSINESS_PARTNER");

        const {A_BusinessPartner} = bupa.entities;
        const {BusinessPartner} = this.entities;

        this.on("READ", bupa, (req) => {
            return BusinessPartnerAPI.run(req.query);
        })
    }
}