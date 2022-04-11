const { query } = require('express');
const { v4: uuidv4 } = require('uuid');
class BusinessPartner extends cds.ApplicationService {
    async init(){
        const bupa = await cds.connect.to("API_BUSINESS_PARTNER");

        const {A_BusinessPartner} = bupa.entities;

        const {BusinessPartner} = this.entities;

        this.on("READ", BusinessPartner, async (req) => {
            this.oCurrentRequest = req.query.SELECT

            let oQuery;
            let aColumns = [];
            
            aColumns.push({ref: 'BusinessPartner'});
            aColumns.push({ref: 'FirstName'});
            aColumns.push({ref: 'LastName'});
            aColumns.push({ref: 'BusinessPartnerFullName'});
            const oAddress = {
                ref: ["to_BusinessPartnerAddress"],
                expand: [
                    {ref: 'CityName'},
                    {ref: 'CompanyPostalCode'},
                    {ref: 'Country'}
                ]
            }
            aColumns.push(oAddress);

            if(req.query.SELECT.where){
                const aWhereClauses = this._buildWhereClauses(req)
                if(aWhereClauses.length ===1){
                    oQuery = this._buildQuery(A_BusinessPartner, aColumns, aWhereClauses[0])
                }else{
                    oQuery = this._buildQuery(A_BusinessPartner, aColumns, null)
                }
            }else if(req.query.SELECT.search){
                //buildSearchClause
            } else if (req.query.SELECT.from.ref[0].where){
                const aWhereClauses = this._buildWhereClauses(req)
                if(aWhereClauses.length > 0){
                    const sUUID = aWhereClauses[0].ID
                    const aBPWhereClause = await SELECT.from(BusinessPartner).columns("BusinessPartner").where({ID : sUUID})
                    oQuery = this._buildQuery(A_BusinessPartner, aColumns, aBPWhereClause[0])
                }else{
                    oQuery = this._buildQuery(A_BusinessPartner, aColumns, null)
                }
            }else{
                oQuery = this._buildQuery(A_BusinessPartner, aColumns, null)
            }

            const aBusinessPartner = await bupa.tx(req).run(oQuery)

            const mBusinessPartnerMapping = new Map()

            const aBusinessPartnerIDs = aBusinessPartner.map((oBusinessPartner) => oBusinessPartner.BusinessPartner)
            const aBusinessPartnerUUIDs = await cds.run(
                SELECT.from(BusinessPartner)
                    .columns("ID", "BusinessPartner")
                    .where({BusinessPartner: aBusinessPartner})
            );

            const aInsertPromises = aBusinessPartnerIDs.map((sBusinessPartnerID) => {
                const oUUID = aBusinessPartnerUUIDs.find(
                    (oBusinessPartnerUUID) =>
                        oBusinessPartnerUUID.BusinessPartner === sBusinessPartnerID
                )

                if(!oUUID){
                    const sUUID = uuidv4()

                    return cds.run(
                        INSERT.into(BusinessPartner).entries({
                            ID : sUUID,
                            BusinessPartner : sBusinessPartnerID
                        })
                    )
                }
            })

            await Promise.all(aInsertPromises)

            const aData = await cds.run(
                SELECT.from(req.query.SELECT.from).where({
                    BusinessPartner: aBusinessPartnerIDs,
                })
            )

            aData.forEach((oData) => {
                mBusinessPartnerMapping.set(oData.BusinessPartner, oData)
            })

            const aResult = aBusinessPartner.map((oData) => {
                const oRecord = mBusinessPartnerMapping.get(oData.BusinessPartner)
                if(!oRecord){
                    return
                }

                oRecord.FirstName = oData.FirstName;
                oRecord.LastName = oData.LastName;
                oRecord.BusinessPartnerIsBlocked = oData.BusinessPartnerIsBlocked

                if(this._isColumnRequest("CityName"))
                    oRecord.CityName = oData.to_BusinessPartnerAddress[0]?.CityName || "";
                if(this._isColumnRequest("CompanyPostalCode"))
                    oRecord.CompanyPostalCode = oData.to_BusinessPartnerAddress[0]?.CompanyPostalCode || "";
                if(this._isColumnRequest("Country"))
                    oRecord.Country = oData.to_BusinessPartnerAddress[0]?.Country || "";

                return oRecord
            });

            if(req.query.SELECT.count){
                aResult["$count"] = aResult.length
            }

            
            return aResult
            
        })
        await super.init()
    }

    /**
     * Method to check if a specific Column is requested or not
     * 
     * @param {string} oColName name of Column which is checked for request
     * @returns {boolean} boolean if oColName is requested or not
     */
    _isColumnRequest(oColName){
        if(!this.oCurrentRequest.columns){
            return true
        }
        if(
            this.oCurrentRequest.columns.some(
                (oColumn) =>
                    oColumn === oColName ||
                    oColumn.ref === oColName ||
                    oColumn.ref[0] === oColName
            )
        ){
            return true
        }
        return false
    }
    
    /**
     * Method to put the Query together correctly
     * 
     * @param {object} oEntity the Entity the Query Selects from
     * @param {Array} aColumns the Columns the Query Selects
     * @param {Array} where where Clauses if Query requires
     * @returns {Object} the Complete Query
     */
    _buildQuery(oEntity, aColumns, where) {
        if(oEntity){
            if(Array.isArray(aColumns) && aColumns.length > 0){
                let oQuery = SELECT.from(oEntity).columns(aColumns);
                if(where){
                    oQuery = oQuery.where(where)
                }
                return oQuery
            }
        } else {
            return
        }
    }

    _buildWhereClauses(req) {
        // let aReqWhere
        let aWhereClauses = []
        if(req.query.SELECT.where){
            const aReqWhere = req.query.SELECT.where

            const aSelectionFields = req.target["@UI.SelectionFields"]

            for(let i=0; i < aReqWhere.length; i++){
                let oObj = aReqWhere[i]
                if(oObj.ref){
                    for(let j=0; j< aSelectionFields.length; j++){
                        if(oObj.ref[0] === aSelectionFields[j]["="]){
                            i+= 2;
                            let oWhereClause = {}
                            oWhereClause[oObj["ref"][0]] = aReqWhere[i].val;
                            aWhereClauses.push(oWhereClause)
                        } 
                    }
                }
            }
        } else {
            const aReqWhere = req.query.SELECT.from.ref[0].where

            for(let i=0; i < aReqWhere.length; i++){
                let oObj = aReqWhere[i]
                if(oObj.ref){
                    i+= 2;
                    let oWhereClause = {}
                    oWhereClause[oObj["ref"][0]] = aReqWhere[i].val;
                    aWhereClauses.push(oWhereClause)
                }
            }
        }
        
        return aWhereClauses;
    }
}

module.exports = {BusinessPartner}