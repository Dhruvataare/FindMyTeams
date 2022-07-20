import { useState } from "react";
import "./TeamInfoTileChannelDocuments.css";
import { Button, Dialog } from "@fluentui/react-northstar";
import { ArchiveIcon } from '@fluentui/react-icons-northstar';
import { ChannelDocumentsPortal } from "./ChannelDocumentsPortal";

export function TeamInfoTileChannelDocuments(props: { teamData?: any, getIsPopupOpen?: any }) {
    const { teamData, getIsPopupOpen } = { ...props };
    const [isPortal, togglePortal] = useState(false);
    const [execute, setExecute] = useState(false);    
    const openPortal = () => {
        togglePortal(true);
        getIsPopupOpen(true);
        setExecute(true);
    }
    const closePortal = () => {
        togglePortal(false);
        getIsPopupOpen(false);
        setExecute(false);
    }
    return (
        <Dialog
            open={isPortal}
            className="ChannelDocumentsPortalContainer"
            content={execute
                ? <ChannelDocumentsPortal
                    teamData={teamData}
                    closePortal={closePortal}
                />
                : <></>
            }
            trigger={<Button
                icon={<ArchiveIcon outline rotate={0} size="large" />}
                text
                iconOnly
                title="Documents"
                onClick={openPortal}
            />}
        />
    );
}
