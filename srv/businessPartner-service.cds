using {API_BUSINESS_PARTNER as bupa} from '../srv/external/API_BUSINESS_PARTNER.cds';

service BusinessPartner {
    
    entity A_BusinessPartner as projection on bupa.A_BusinessPartner{
        *
    };

}

annotate BusinessPartner.A_BusinessPartner with @(UI: {
    SelectionFields : [BusinessPartner],
    LineItem        : [
        {Value : BusinessPartner},
        {Value : Customer},
        {Value : Supplier},
    ],
});