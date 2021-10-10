/*
    EntityTypeTableMapper: entityType -> entityTable
 */
class EntityTypeTableMapper {
    static readonly map: Map<string, string> = new Map([
        ['testEntityType', 'testCmodsTable'],
        ['CIND', 'customer-dev-individual']
    ]);

    static readonly keys: Set<string> = new Set(EntityTypeTableMapper.map.keys())

    static valid = (entityType: string): boolean => EntityTypeTableMapper.keys.has(entityType)
}


export default EntityTypeTableMapper