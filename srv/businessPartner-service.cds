using {API_BUSINESS_PARTNER as bupa} from './external/API_BUSINESS_PARTNER.cds';
using { cuid } from '@sap/cds/common';

service BusinessPartner {

    entity A_BusinessPartner as projection on bupa.A_BusinessPartner {
        key BusinessPartner,
            FirstName,
            LastName,
            BusinessPartnerFullName
    };

    entity A_BusinessPartnerAddress as projection on bupa.A_BusinessPartnerAddress{
        key BusinessPartner,
        key AddressID,
            CityName,
            CompanyPostalCode,
            Country,
            HouseNumber,
    };

    @fiori.draft.enabled
    entity BusinessPartner: cuid  {
        key ID : UUID;
            @title:     'ID'
            BusinessPartner : String(40);
            @title:     'First Name'
            FirstName   : String(40);
            @title:     'Last Name'
            LastName    : String(40);
            @title:     'Fullname'
            BusinessPartnerFullName : String(40);
            @title:     'City'
            CityName    : String(40);
            @title:     'PLZ'
            CompanyPostalCode   : String(10);
            @title:     'Country'
            Country     : String(3);
    }
}

annotate BusinessPartner.BusinessPartner with @(UI : {
    SelectionFields  : [BusinessPartner],
    LineItem         : [
        {
            Label: 'ID',
            Value : BusinessPartner
        },
        {
            Label: 'FirstName',
            Value : FirstName
        },
        {
            Label: 'LastName',
            Value : LastName
        },
        {
            Label: 'City',
            Value : CityName
        },
        {
            Label: 'Country',
            Value : Country
        },
    ],
    HeaderInfo       : {
        TypeName    : 'BusinessPartner',
        TypeNamePlural    : 'BusinessPartners',
        Title       : {
            $Type   : 'UI.DataField',
            Value   : {
                $edmJson : {
                    $Apply :[
                        {
                            $Path  : 'FirstName',
                        },
                        ' ',
                        {
                            $Path  : 'LastName',
                        }
                    ],
                    $Function   : 'odata.concat'
                }
            }
        },
        Description : {Value : BusinessPartner}
    },
    Facets     : [{
        $Type  : 'UI.ReferenceFacet',
        Label: 'Business Partner Info',
        Target : '@UI.FieldGroup#Main',
    }, ],
    FieldGroup#Main : {Data : [
        {Value : BusinessPartner},
        {Value : FirstName},
        {Value : LastName},
        {Value : CityName},
        {Value : Country},
    ]}
});


annotate BusinessPartner.BusinessPartner with @odata.draft.enabled;