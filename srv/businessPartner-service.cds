using {API_BUSINESS_PARTNER as bupa} from '../srv/external/API_BUSINESS_PARTNER.cds';

service BusinessPartner {
    
    entity A_BusinessPartner as projection on bupa.A_BusinessPartner{
        *
    };

    entity Customer {
        key BusinessPartner : String(40);
        FirstName : String(40);
        LastName : String(40);
    };
}