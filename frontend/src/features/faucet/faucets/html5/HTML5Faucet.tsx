import { MessageType } from "@common/messages";
import { sendLobbyMessage } from "@data/lobby";
import { FaucetContext } from "@features/faucet/Faucet";
import {
    selectLastPositionUpdateTimestamp,
    selectLastSeekTarget,
    selectShouldBePaused,
} from "@features/faucet/faucetSelectors";
import { FaucetState } from "@features/faucet/FaucetState";
import { selectIsCurrentUserHost } from "@features/memberList/memberListSelectors";
import { selectCurrentMediaObject } from "@features/queue/queueSelectors";
import { useAnimationFrame } from "@util/useAnimationFrame";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./html5Faucet.css";

export const HTML5Faucet = () => {
    const shouldBePaused = useSelector(selectShouldBePaused);
    const lastSeekTarget = useSelector(selectLastSeekTarget);
    const lastUpdateTime = useSelector(selectLastPositionUpdateTimestamp);
    const FaucetControl = useContext(FaucetContext);
    const isCurrentUserHost = useSelector(selectIsCurrentUserHost);
    const dispatch = useDispatch();

    const currentMedia = useSelector(selectCurrentMediaObject)!;

    const playerRef = useRef<HTMLVideoElement>(null);

    const onLoad = useCallback(() => {
        if (!currentMedia.duration && isCurrentUserHost) {
            const duration = playerRef.current?.duration;
            if (duration) {
                sendLobbyMessage({
                    type: MessageType.SET_MEDIA_DURATION,
                    duration,
                    guid: currentMedia.guid,
                });
            }
        }
    }, [currentMedia]);

    useEffect(() => {
        if (shouldBePaused) {
            playerRef.current?.pause();
        } else {
            playerRef.current?.play();
        }
    }, [shouldBePaused]);

    const onPlay = useCallback(() => {
        if (isCurrentUserHost) {
            FaucetControl.play(playerRef.current?.currentTime);
            dispatch(FaucetState.actions.play());
        }
    }, [isCurrentUserHost]);

    const onPause = useCallback(() => {
        if (isCurrentUserHost) {
            FaucetControl.pause(playerRef.current?.currentTime);
            dispatch(FaucetState.actions.pause());
        }
    }, [isCurrentUserHost]);

    const onSeeking = useCallback(() => {
        if (isCurrentUserHost && playerRef.current) {
            FaucetControl.seek(playerRef.current.currentTime);
            dispatch(FaucetState.actions.seek(playerRef.current.currentTime));
        }
    }, [isCurrentUserHost]);

    useAnimationFrame(() => {
        if (isCurrentUserHost) {
            return;
        }
        if (!playerRef.current) {
            return;
        }
        if (shouldBePaused && !playerRef.current.paused) {
            playerRef.current.pause();
        }
        if (!shouldBePaused && playerRef.current.paused) {
            playerRef.current.play();
        }
        const currentTime = playerRef.current.currentTime;
        const durationSinceLastUpdate = shouldBePaused ? 0 : (Date.now() - lastUpdateTime) / 1000;
        const estimatedCorrectTime = lastSeekTarget + durationSinceLastUpdate;
        const diff = Math.abs(currentTime - estimatedCorrectTime);
        if (diff > 0.5) {
            playerRef.current.currentTime = estimatedCorrectTime;
        }
    }, [shouldBePaused, lastSeekTarget, lastUpdateTime, isCurrentUserHost]);

    const elementType = currentMedia.faucet_type === "HTML5Video" ? "video" : "audio";

    return React.createElement(elementType, {
        className: currentMedia.faucet_type,
        src: currentMedia.url,
        ref: playerRef,
        controls: true,
        onLoad,
        onLoadedMetadata: onLoad,
        onPlay,
        onPause,
        onSeeking,
    });
};
