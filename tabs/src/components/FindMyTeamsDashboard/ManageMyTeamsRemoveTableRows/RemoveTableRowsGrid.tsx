import React from "react";
import "./ManageMyTeamsRemoveTableRows.css";
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export function RemoveTableRowsGrid(props: { header: any, rows: any, getRemoveMembersData: any }) {
    const { header, rows, getRemoveMembersData } = { ...props };
    const [pageSize, setPageSize] = React.useState<number>(10);
    const columns: GridColDef[] = header.items;
    const handleSelectedRows = (ids: any) => {
        const selectedIDs = new Set(ids);
        const reqSelectedRowData = rows.filter((row: any) =>
            selectedIDs.has(row.key)
        );
        getRemoveMembersData(reqSelectedRowData);
    }

    return (
        <>
            <div style={{ width: '100%', height: 370 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={pageSize}
                    disableColumnMenu
                    pagination
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    rowsPerPageOptions={[10, 25, 50]}
                    checkboxSelection
                    onSelectionModelChange={handleSelectedRows}
                />
            </div>
        </>

    );
}
