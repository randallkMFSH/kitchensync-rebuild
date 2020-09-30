import { MediaObject } from "@common/apiModels";
import {
    selectLastPositionUpdateTimestamp,
    selectLastSeekTarget,
    selectShouldBePaused,
} from "@features/faucet/faucetSelectors";
import { selectIsCurrentUserHost } from "@features/memberList/memberListSelectors";
import { getDataOrPrevious, isError, isLoading, isNotRequested } from "@util/LCE";
import { useAnimationFrame } from "@util/useAnimationFrame";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./queue.css";
import { selectQueue, selectQueueErrorMessage } from "./queueSelectors";
import { QueueState } from "./QueueState";

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const AddToQueueButton = (props: ButtonProps) => {
    return (
        <button className="addToQueue" title="Add to queue" {...props}>
            +
        </button>
    );
};

const ChangeMediaButton = (props: ButtonProps) => {
    return (
        <button className="changeMedia" title="Change video" {...props}>
            ▶
        </button>
    );
};

interface DurationIndicatorProps {
    mediaObject: MediaObject;
}
const DurationIndicator = (props: DurationIndicatorProps) => {
    const duration = props.mediaObject.duration!;
    const lastSeekTarget = useSelector(selectLastSeekTarget);
    const lastUpdateTime = useSelector(selectLastPositionUpdateTimestamp);
    const shouldBePaused = useSelector(selectShouldBePaused);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const estimatedCorrectTime = lastSeekTarget + (Date.now() - lastUpdateTime) / 1000;
        setCurrentTime(Math.round(estimatedCorrectTime));
    }, []);

    useAnimationFrame(() => {
        if (shouldBePaused) {
            return;
        }
        const estimatedCorrectTime = lastSeekTarget + (Date.now() - lastUpdateTime) / 1000;
        setCurrentTime(Math.round(estimatedCorrectTime));
    }, [lastSeekTarget, lastUpdateTime, shouldBePaused]);

    return <progress value={currentTime} max={duration} />;
};

interface MediaObjectTileProps {
    mediaObject: MediaObject;
    isCurrentMedia: boolean;
}
const MediaObjectTile = (props: MediaObjectTileProps) => {
    const { mediaObject, isCurrentMedia } = props;
    const [isHovering, setIsHovering] = useState(false);
    const onMouseOver = useCallback((event: React.FocusEvent<HTMLLIElement> | React.MouseEvent<HTMLLIElement>) => {
        setIsHovering(true);
    }, []);
    const onMouseLeave = useCallback((event: React.FocusEvent<HTMLLIElement> | React.MouseEvent<HTMLLIElement>) => {
        // Don't hide if we're moving focus internally
        if (
            event.relatedTarget &&
            event.relatedTarget instanceof Node &&
            event.currentTarget.contains(event.relatedTarget)
        ) {
            return;
        }
        setIsHovering(false);
    }, []);
    const dispatch = useDispatch();
    const deleteThisMedia = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        dispatch(QueueState.actions.deleteMedia(mediaObject.guid));
        event.preventDefault();
    }, []);
    const skipToThisMedia = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        dispatch(QueueState.actions.skipToMedia(mediaObject.guid));
        event.preventDefault();
    }, []);
    const className = `mediaTile ${mediaObject.faucet_type} ${mediaObject.image_url ? "hasImage" : "noImage"}`;
    const style = mediaObject.image_url ? { backgroundImage: `url(${mediaObject.image_url})` } : undefined;
    return (
        <li
            className={className}
            style={style}
            title={mediaObject.title}
            onFocus={onMouseOver}
            onBlur={onMouseLeave}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
            tabIndex={0}>
            {isHovering && (
                <>
                    <button className="deleteMedia" onClick={deleteThisMedia} title="Delete this">
                        🗑
                    </button>
                    {!isCurrentMedia && (
                        <button className="skipToMedia" onClick={skipToThisMedia} title="Skip to this">
                            ▶
                        </button>
                    )}
                </>
            )}
            {isCurrentMedia && mediaObject.duration !== undefined && mediaObject.duration !== 0 && (
                <DurationIndicator mediaObject={mediaObject} />
            )}
        </li>
    );
};

interface QueueListProps {
    onAddToQueueClick: ButtonProps["onClick"];
    disableAddToQueue: boolean;
}
const QueueList = (props: QueueListProps) => {
    const queueLCE = useSelector(selectQueue);
    const isHost = useSelector(selectIsCurrentUserHost);
    if (isError(queueLCE) || isNotRequested(queueLCE)) {
        return <span>Something went wrong loading the queue. :(</span>;
    }
    const queue = getDataOrPrevious(queueLCE);
    const videos = queue?.map((media, index) => {
        return <MediaObjectTile key={media.guid} mediaObject={media} isCurrentMedia={index === 0} />;
    });
    return (
        <ol className="mediaList">
            {videos}
            {isLoading(queueLCE) && <li className="mediaTile loading"></li>}
            {isHost && <AddToQueueButton onClick={props.onAddToQueueClick} disabled={props.disableAddToQueue} />}
        </ol>
    );
};

export const Queue = () => {
    const isHost = useSelector(selectIsCurrentUserHost);

    const dispatch = useDispatch();

    const [mediaUrl, setMediaUrl] = useState("");

    const onSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!isHost) {
                return;
            }
            dispatch(QueueState.actions.changeMedia(mediaUrl));
            setMediaUrl("");
        },
        [isHost, mediaUrl]
    );

    const onAddToQueueClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            if (!isHost) {
                return;
            }
            dispatch(QueueState.actions.addToQueue(mediaUrl));
            setMediaUrl("");
        },
        [isHost, mediaUrl]
    );

    const onChangeMediaClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            if (!isHost) {
                return;
            }
            dispatch(QueueState.actions.changeMedia(mediaUrl));
            setMediaUrl("");
        },
        [isHost, mediaUrl]
    );

    const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMediaUrl(event.target.value);
    };

    const errorMessage = useSelector(selectQueueErrorMessage);
    const dismissError = () => {
        dispatch(QueueState.actions.setError(undefined));
    };

    const doesUrlLookValid = mediaUrl.length > 3;

    return (
        <form className="queue" onSubmit={onSubmit}>
            <QueueList onAddToQueueClick={onAddToQueueClick} disableAddToQueue={!doesUrlLookValid} />
            {isHost && (
                <section className="controlPanel">
                    {errorMessage && (
                        <span className="error">
                            {errorMessage} <button onClick={dismissError}>X</button>
                        </span>
                    )}
                    <input value={mediaUrl} onChange={onUrlChange} />
                    <ChangeMediaButton onClick={onChangeMediaClick} disabled={!doesUrlLookValid} />
                </section>
            )}
        </form>
    );
};
